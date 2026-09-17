// OAuth oficial do Instagram para conta profissional. Reusa o cofre
// command.integracoes_tokens e a cifra server-side já adotados pelo YouTube.
import { readCommand, upsertCommand, deleteCommand, commandConfigured } from './_command.js'
import { encrypt, decrypt, signState, verifyState } from './_crypto.js'

const MIGRATION_HINT = 'A tabela command.integracoes_tokens precisa existir no Supabase mestre.'
const AUTH_URL = 'https://www.instagram.com/oauth/authorize'
const TOKEN_URL = 'https://api.instagram.com/oauth/access_token'
const LONG_TOKEN_URL = 'https://graph.instagram.com/access_token'
const PROFILE_URL = 'https://graph.instagram.com/me'
const SCOPES = [
  'instagram_business_basic',
  'instagram_business_content_publish',
  'instagram_business_manage_comments',
  'instagram_business_manage_messages',
]

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
    // account_label só vira @username quando o Instagram devolveu um
    // (completeInstagramConnection); sem isso vira o nome de exibição, que
    // não é um handle válido de URL — nesse caso não inventa link.
    const username = typeof row.account_label === 'string' && row.account_label.startsWith('@') ? row.account_label.slice(1) : null
    return {
      connected: true,
      accountLabel: row.account_label,
      profileUrl: username ? `https://www.instagram.com/${username}/` : null,
      scope: row.scope,
      expiresAt: row.expires_at,
      atualizadoEm: row.atualizado_em,
    }
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

// --- Reels (publicação real) --------------------------------------------
// Diferente do YouTube (upload direto de binário), a API do Instagram exige
// uma URL PÚBLICA do vídeo — por isso aponta direto pro storage_path já
// público que generateVideo grava em content_assets (Supabase Storage),
// sem baixar/reenviar o binário. Orquestração completa (idempotência,
// polling do container, gravação em content_calendar) fica em
// api/_content.js#postToInstagram; aqui só as chamadas HTTP à Meta.
const MEDIA_URL = (igUserId) => `https://graph.instagram.com/${igUserId}/media`
const MEDIA_PUBLISH_URL = (igUserId) => `https://graph.instagram.com/${igUserId}/media_publish`
const CONTAINER_STATUS_URL = (creationId) => `https://graph.instagram.com/${creationId}`
const REFRESH_URL = 'https://graph.instagram.com/refresh_access_token'
const REFRESH_SLACK_MS = 24 * 60 * 60 * 1000 // token de longa duração dura ~60 dias; renova com 1 dia de folga

/**
 * Devolve {accessToken, igUserId} prontos pra chamar a API de publicação.
 * Diferente do YouTube, o Instagram não tem refresh_token separado: o
 * próprio access_token de longa duração se renova (chamada com ele mesmo),
 * desde que ainda não tenha expirado. Sem token salvo, ou já vencido demais
 * pra renovar, falha fechado pedindo pro Founder reconectar.
 */
export async function getValidInstagramAccess() {
  if (!commandConfigured()) {
    const err = new Error('SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY não configuradas nesta implantação.')
    err.status = 503
    throw err
  }
  let row
  try {
    const rows = await readCommand('integracoes_tokens', '?select=account_id,access_token_enc,expires_at&provider=eq.instagram&limit=1')
    row = rows?.[0]
  } catch (e) {
    const err = new Error(`${MIGRATION_HINT} (${e.message})`)
    err.status = 503
    throw err
  }
  if (!row || !row.account_id) {
    const err = new Error('Nenhum perfil do Instagram conectado. Conecte em Integrações antes de publicar.')
    err.status = 404
    throw err
  }

  const expiresAt = row.expires_at ? new Date(row.expires_at).getTime() : 0
  const expired = !expiresAt || Date.now() > expiresAt - REFRESH_SLACK_MS
  let accessToken = decrypt(row.access_token_enc)
  if (!expired) return { accessToken, igUserId: row.account_id }

  const refreshUrl = new URL(REFRESH_URL)
  refreshUrl.searchParams.set('grant_type', 'ig_refresh_token')
  refreshUrl.searchParams.set('access_token', accessToken)
  const refreshRes = await fetch(refreshUrl)
  const refreshBody = await refreshRes.json().catch(() => ({}))
  if (!refreshRes.ok || !refreshBody.access_token) {
    const err = new Error(`O token do Instagram venceu e não foi possível renovar: ${refreshBody.error?.message || refreshRes.status} — reconecte o perfil em Integrações.`)
    err.status = 401
    throw err
  }

  accessToken = refreshBody.access_token
  try {
    await upsertCommand('integracoes_tokens', {
      provider: 'instagram',
      access_token_enc: encrypt(accessToken),
      expires_at: refreshBody.expires_in ? new Date(Date.now() + Number(refreshBody.expires_in) * 1000).toISOString() : null,
    }, 'provider')
  } catch (e) {
    const err = new Error(`${MIGRATION_HINT} (${e.message})`)
    err.status = 503
    throw err
  }
  return { accessToken, igUserId: row.account_id }
}

/** Cria o container do Reels a partir de uma URL pública de vídeo. Devolve o creation_id — ainda não publicado. */
export async function createReelsContainer({ accessToken, igUserId, videoUrl, caption }) {
  const body = new URLSearchParams({ media_type: 'REELS', video_url: videoUrl, access_token: accessToken })
  if (caption) body.set('caption', caption)
  const res = await fetch(MEDIA_URL(igUserId), { method: 'POST', body })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || !json.id) {
    const err = new Error(`Instagram recusou criar o container: ${json.error?.message || res.status}`)
    err.status = res.status && res.status >= 400 && res.status < 600 ? res.status : 502
    throw err
  }
  return json.id
}

/** Consulta o processamento do container. status_code: EXPIRED | ERROR | FINISHED | IN_PROGRESS | PUBLISHED. */
export async function checkContainerStatus({ accessToken, creationId }) {
  const url = new URL(CONTAINER_STATUS_URL(creationId))
  url.searchParams.set('fields', 'status_code')
  url.searchParams.set('access_token', accessToken)
  const res = await fetch(url)
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(`Instagram recusou consultar o container: ${json.error?.message || res.status}`)
    err.status = res.status && res.status >= 400 && res.status < 600 ? res.status : 502
    throw err
  }
  return json.status_code || 'UNKNOWN'
}

/** Publica um container já FINISHED. Devolve o media id real, público no perfil. */
export async function publishReelsContainer({ accessToken, igUserId, creationId }) {
  const body = new URLSearchParams({ creation_id: creationId, access_token: accessToken })
  const res = await fetch(MEDIA_PUBLISH_URL(igUserId), { method: 'POST', body })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || !json.id) {
    const err = new Error(`Instagram recusou publicar o Reels: ${json.error?.message || res.status}`)
    err.status = res.status && res.status >= 400 && res.status < 600 ? res.status : 502
    throw err
  }
  return json.id
}

// --- Automação de Comentários e DMs ----------------------------------------

const COMMENT_REPLY_URL = (commentId) => `https://graph.instagram.com/v19.0/${commentId}/replies`

/** Responde a um comentário público. Devolve o id da resposta criada. */
export async function replyToComment({ accessToken, commentId, message }) {
  const res = await fetch(COMMENT_REPLY_URL(commentId), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ message, access_token: accessToken }),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || !json.id) {
    const err = new Error(`Instagram recusou responder comentário: ${json.error?.message || res.status}`)
    err.status = res.status && res.status >= 400 && res.status < 600 ? res.status : 502
    throw err
  }
  return json.id
}

/** Envia DM para um usuário via Instagram Messaging API. */
export async function sendDirectMessage({ accessToken, igUserId, recipientId, message }) {
  const res = await fetch(`https://graph.instagram.com/v19.0/${igUserId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ recipient: { id: recipientId }, message: { text: message } }),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(`Instagram recusou enviar DM: ${json.error?.message || res.status}`)
    err.status = res.status && res.status >= 400 && res.status < 600 ? res.status : 502
    throw err
  }
  return json
}

/** Lê a config de automação (toggle + prompt base). Fail-open: desabilitado por padrão. */
export async function getAutomationConfig() {
  if (!commandConfigured()) return { enabled: false, prompt_base: null }
  try {
    const rows = await readCommand('instagram_automation', '?select=enabled,prompt_base&limit=1')
    if (!rows?.length) return { enabled: false, prompt_base: null }
    return rows[0]
  } catch {
    return { enabled: false, prompt_base: null }
  }
}

/** Salva config de automação (cria ou atualiza a única linha de config). */
export async function upsertAutomationConfig({ enabled, promptBase }) {
  await upsertCommand('instagram_automation', {
    id: 1,
    enabled: Boolean(enabled),
    prompt_base: typeof promptBase === 'string' && promptBase.trim() ? promptBase.trim() : null,
    updated_at: new Date().toISOString(),
  }, 'id')
}

/** Grava um registro de resposta automática. Fail-silent — nunca derruba o webhook. */
export async function logAutomationReply({ type, incomingId, incomingText, response, error }) {
  if (!commandConfigured()) return
  try {
    await writeCommand('instagram_automation_log', {
      type: String(type),
      incoming_id: String(incomingId || '').slice(0, 64),
      incoming_text: String(incomingText || '').slice(0, 1000),
      response_text: response != null ? String(response).slice(0, 1000) : null,
      error: error != null ? String(error).slice(0, 500) : null,
    })
  } catch {
    // silencioso — log nunca quebra o fluxo principal
  }
}

/** Lista as últimas 50 respostas automáticas (mais recentes primeiro). */
export async function listAutomationLogs() {
  if (!commandConfigured()) return []
  try {
    const rows = await readCommand('instagram_automation_log', '?select=id,created_at,type,incoming_id,incoming_text,response_text,error&order=created_at.desc&limit=50')
    return rows || []
  } catch {
    return []
  }
}
