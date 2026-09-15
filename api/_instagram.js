// OAuth oficial do Instagram para conta profissional. Reusa o cofre
// command.integracoes_tokens e a cifra server-side já adotados pelo YouTube.
import { readCommand, upsertCommand, deleteCommand, commandConfigured } from './_command.js'
import { encrypt, signState, verifyState } from './_crypto.js'

const MIGRATION_HINT = 'A tabela command.integracoes_tokens precisa existir no Supabase mestre.'
const AUTH_URL = 'https://www.instagram.com/oauth/authorize'
const TOKEN_URL = 'https://api.instagram.com/oauth/access_token'
const LONG_TOKEN_URL = 'https://graph.instagram.com/access_token'
const PROFILE_URL = 'https://graph.instagram.com/me'
const SCOPES = ['instagram_business_basic', 'instagram_business_content_publish']

function oauthEnv() {
  const appId = process.env.META_APP_ID
  const appSecret = process.env.META_APP_SECRET
  const redirectUri = process.env.META_OAUTH_REDIRECT_URI
  const faltando = [!appId && 'META_APP_ID', !appSecret && 'META_APP_SECRET', !redirectUri && 'META_OAUTH_REDIRECT_URI'].filter(Boolean)
  if (faltando.length) {
    const err = new Error(`Aplicativo Meta incompleto: faltam ${faltando.join(', ')}.`)
    err.status = 503
    throw err
  }
  return { appId, appSecret, redirectUri }
}

export function buildInstagramConnectUrl() {
  const { appId, redirectUri } = oauthEnv()
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: SCOPES.join(','),
    state: signState({ p: 'instagram' }),
  })
  return `${AUTH_URL}?${params.toString()}`
}

export async function completeInstagramConnection({ code, state }) {
  const payload = verifyState(state)
  if (!payload || payload.p !== 'instagram') {
    const err = new Error('O link do Instagram expirou ou não veio deste painel. Tente conectar de novo.')
    err.status = 400
    throw err
  }
  if (!code) {
    const err = new Error('O Instagram não devolveu um código de autorização.')
    err.status = 400
    throw err
  }
  if (!commandConfigured()) {
    const err = new Error('SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY não configuradas nesta implantação.')
    err.status = 503
    throw err
  }
  const { appId, appSecret, redirectUri } = oauthEnv()
  const shortRes = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: appId, client_secret: appSecret, grant_type: 'authorization_code', redirect_uri: redirectUri, code }),
  })
  const shortBody = await shortRes.json().catch(() => ({}))
  if (!shortRes.ok || !shortBody.access_token) {
    const err = new Error(`Instagram recusou a troca do código: ${shortBody.error_message || shortBody.error?.message || shortBody.error || shortRes.status}`)
    err.status = 502
    throw err
  }

  const longUrl = new URL(LONG_TOKEN_URL)
  longUrl.searchParams.set('grant_type', 'ig_exchange_token')
  longUrl.searchParams.set('client_secret', appSecret)
  longUrl.searchParams.set('access_token', shortBody.access_token)
  const longRes = await fetch(longUrl)
  const longBody = await longRes.json().catch(() => ({}))
  if (!longRes.ok || !longBody.access_token) {
    const err = new Error(`Instagram recusou o token de longa duração: ${longBody.error?.message || longBody.error || longRes.status}`)
    err.status = 502
    throw err
  }

  const profileUrl = new URL(PROFILE_URL)
  profileUrl.searchParams.set('fields', 'id,user_id,username,name,account_type')
  profileUrl.searchParams.set('access_token', longBody.access_token)
  const profileRes = await fetch(profileUrl)
  const profile = await profileRes.json().catch(() => ({}))
  if (!profileRes.ok || (!profile.id && !profile.user_id)) {
    const err = new Error(`Instagram não confirmou uma conta profissional: ${profile.error?.message || profileRes.status}`)
    err.status = 502
    throw err
  }

  try {
    await upsertCommand('integracoes_tokens', {
      provider: 'instagram',
      account_id: String(profile.user_id || profile.id),
      account_label: profile.username ? `@${profile.username}` : profile.name || null,
      access_token_enc: encrypt(longBody.access_token),
      refresh_token_enc: null,
      scope: SCOPES.join(' '),
      token_type: longBody.token_type || 'Bearer',
      expires_at: longBody.expires_in ? new Date(Date.now() + Number(longBody.expires_in) * 1000).toISOString() : null,
      conectado_por: 'founder',
    }, 'provider')
  } catch (e) {
    const err = new Error(`${MIGRATION_HINT} (${e.message})`)
    err.status = 503
    throw err
  }
  return { accountLabel: profile.username ? `@${profile.username}` : profile.name || null }
}

export async function computeInstagramStatus() {
  if (!commandConfigured()) return { connected: false, reason: 'SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY não configuradas nesta implantação.' }
  try {
    const rows = await readCommand('integracoes_tokens', '?select=account_label,scope,expires_at,atualizado_em&provider=eq.instagram&limit=1')
    const row = rows?.[0]
    if (!row) return { connected: false, reason: 'Nenhum perfil profissional conectado ainda.' }
    return { connected: true, accountLabel: row.account_label, scope: row.scope, expiresAt: row.expires_at, atualizadoEm: row.atualizado_em }
  } catch (e) {
    return { connected: false, reason: `${MIGRATION_HINT} (${e.message})` }
  }
}

export async function disconnectInstagram() {
  if (!commandConfigured()) {
    const err = new Error('SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY não configuradas nesta implantação.')
    err.status = 503
    throw err
  }
  await deleteCommand('integracoes_tokens', '?provider=eq.instagram')
  return { connected: false }
}

export const instagramScopes = [...SCOPES]
