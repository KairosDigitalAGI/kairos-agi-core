// OAuth do YouTube (Missão 006, Fase 4) — primeira integração ativada de
// verdade, diferente de Instagram/TikTok que esperam aprovação da Meta.
//
// `command.integracoes_tokens` guarda o resultado (migration
// kairos-command/supabase/migrations/0021_integracoes_tokens.sql, AINDA NÃO
// aplicada em produção). Sem a migration, tudo aqui falha fechado citando o
// arquivo pendente — mesmo padrão do Content Engine (Fase 3).
import { readCommand, upsertCommand, deleteCommand, commandConfigured } from './_command.js'
import { encrypt, decrypt, signState, verifyState } from './_crypto.js'

const MIGRATION_HINT =
  'A migration supabase/migrations/0021_integracoes_tokens.sql (repo kairos-command) ainda não foi aplicada em produção — colar no SQL Editor do Supabase para ativar a conexão do YouTube.'

const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const CHANNEL_URL = 'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true'
const SCOPE = 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly'

function oauthEnv() {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI
  const faltando = [
    !clientId && 'GOOGLE_CLIENT_ID',
    !clientSecret && 'GOOGLE_CLIENT_SECRET',
    !redirectUri && 'GOOGLE_OAUTH_REDIRECT_URI',
  ].filter(Boolean)
  if (faltando.length) {
    const err = new Error(
      `Cliente OAuth do Google incompleto: faltam ${faltando.join(', ')}. Crie um OAuth Client Web no Google Cloud Console (o Founder precisa fazer isso — criação de credencial/conta não é automatizada) e configure as três vars na Vercel.`,
    )
    err.status = 503
    throw err
  }
  return { clientId, clientSecret, redirectUri }
}

/** Monta a URL de consentimento do Google. `state` prova, na volta, que este backend a gerou há pouco. */
export function buildConnectUrl() {
  const { clientId, redirectUri } = oauthEnv()
  const state = signState({ p: 'youtube' })
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: SCOPE,
    access_type: 'offline',
    prompt: 'consent',
    state,
  })
  return `${AUTH_URL}?${params.toString()}`
}

/**
 * Troca o `code` do callback por tokens, confirma o canal e grava cifrado.
 * Lança com `.status` definido em todo caminho de recusa — quem chama decide
 * como redirecionar o navegador do Founder de volta ao painel.
 */
export async function completeConnection({ code, state }) {
  const payload = verifyState(state)
  if (!payload || payload.p !== 'youtube') {
    const err = new Error('O link de conexão expirou ou não veio deste painel. Tente conectar de novo.')
    err.status = 400
    throw err
  }
  if (!code) {
    const err = new Error('O Google não devolveu um código de autorização.')
    err.status = 400
    throw err
  }
  if (!commandConfigured()) {
    const err = new Error('SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY não configuradas nesta implantação.')
    err.status = 503
    throw err
  }
  const { clientId, clientSecret, redirectUri } = oauthEnv()

  const tokenRes = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })
  const tokenBody = await tokenRes.json().catch(() => ({}))
  if (!tokenRes.ok) {
    const err = new Error(`Google recusou a troca do código: ${tokenBody.error_description || tokenBody.error || tokenRes.status}`)
    err.status = 502
    throw err
  }

  const channelRes = await fetch(CHANNEL_URL, {
    headers: { Authorization: `Bearer ${tokenBody.access_token}` },
  })
  const channelBody = await channelRes.json().catch(() => ({}))
  const channel = channelRes.ok ? channelBody.items?.[0] : null

  try {
    await upsertCommand(
      'integracoes_tokens',
      {
        provider: 'youtube',
        account_id: channel?.id || null,
        account_label: channel?.snippet?.title || null,
        access_token_enc: encrypt(tokenBody.access_token),
        refresh_token_enc: tokenBody.refresh_token ? encrypt(tokenBody.refresh_token) : null,
        scope: tokenBody.scope || SCOPE,
        token_type: tokenBody.token_type || 'Bearer',
        expires_at: tokenBody.expires_in ? new Date(Date.now() + tokenBody.expires_in * 1000).toISOString() : null,
        conectado_por: 'founder',
      },
      'provider',
    )
  } catch (e) {
    const err = new Error(`${MIGRATION_HINT} (${e.message})`)
    err.status = 503
    throw err
  }

  return { accountLabel: channel?.snippet?.title || null }
}

/** Estado real da conexão — nunca revela o token, só o que já é público (nome do canal, validade). */
export async function computeYoutubeStatus() {
  if (!commandConfigured()) {
    return { connected: false, reason: 'SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY não configuradas nesta implantação.' }
  }
  try {
    const rows = await readCommand('integracoes_tokens', '?select=account_label,scope,expires_at,atualizado_em&provider=eq.youtube&limit=1')
    const row = rows?.[0]
    if (!row) return { connected: false, reason: 'Nenhum canal conectado ainda.' }
    return {
      connected: true,
      accountLabel: row.account_label,
      scope: row.scope,
      expiresAt: row.expires_at,
      atualizadoEm: row.atualizado_em,
    }
  } catch (e) {
    return { connected: false, reason: `${MIGRATION_HINT} (${e.message})` }
  }
}

/** Desconecta: apaga a linha. Idempotente — chamar sem conexão ativa não é erro. */
export async function disconnectYoutube() {
  if (!commandConfigured()) {
    const err = new Error('SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY não configuradas nesta implantação.')
    err.status = 503
    throw err
  }
  try {
    await deleteCommand('integracoes_tokens', '?provider=eq.youtube')
  } catch (e) {
    const err = new Error(`${MIGRATION_HINT} (${e.message})`)
    err.status = 503
    throw err
  }
  return { connected: false }
}

// Exportado só para os testes conseguirem decifrar o que `completeConnection`
// gravaria, sem duplicar a lógica de cifra em lugar nenhum.
export const _internals = { decrypt }
