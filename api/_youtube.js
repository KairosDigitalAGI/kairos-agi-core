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
    const rows = await readCommand('integracoes_tokens', '?select=account_id,account_label,scope,expires_at,atualizado_em&provider=eq.youtube&limit=1')
    const row = rows?.[0]
    if (!row) return { connected: false, reason: 'Nenhum canal conectado ainda.' }
    return {
      connected: true,
      accountLabel: row.account_label,
      // channel.id é o ID real e estável do canal (Fase 4, gravado em
      // completeConnection) — dá pra montar a URL pública do canal sem
      // precisar de nenhuma chamada nova à API do Google.
      profileUrl: row.account_id ? `https://www.youtube.com/channel/${row.account_id}` : null,
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

const UPLOAD_URL = 'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=multipart&part=snippet,status'
const REFRESH_SLACK_MS = 60 * 1000 // renova um pouco antes do vencimento real, nunca depois

/**
 * Devolve um access_token válido do canal conectado — decifra o que está
 * salvo e, se estiver vencido (ou perto disso), troca pelo refresh_token
 * antes de devolver. Nunca decide sozinho reconectar do zero: sem
 * refresh_token salvo, falha fechado e pede pro Founder reconectar em
 * Integrações (fluxo completo de consentimento, não algo automatizável).
 */
export async function getValidAccessToken() {
  if (!commandConfigured()) {
    const err = new Error('SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY não configuradas nesta implantação.')
    err.status = 503
    throw err
  }
  let row
  try {
    const rows = await readCommand('integracoes_tokens', '?select=access_token_enc,refresh_token_enc,expires_at&provider=eq.youtube&limit=1')
    row = rows?.[0]
  } catch (e) {
    const err = new Error(`${MIGRATION_HINT} (${e.message})`)
    err.status = 503
    throw err
  }
  if (!row) {
    const err = new Error('Nenhum canal do YouTube conectado. Conecte em Integrações antes de postar.')
    err.status = 404
    throw err
  }

  const expiresAt = row.expires_at ? new Date(row.expires_at).getTime() : 0
  const expired = !expiresAt || Date.now() > expiresAt - REFRESH_SLACK_MS
  if (!expired) return decrypt(row.access_token_enc)

  if (!row.refresh_token_enc) {
    const err = new Error('O token do YouTube venceu e não há refresh_token salvo — reconecte o canal em Integrações.')
    err.status = 401
    throw err
  }
  const { clientId, clientSecret } = oauthEnv()
  const refreshToken = decrypt(row.refresh_token_enc)

  const tokenRes = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
    }),
  })
  const tokenBody = await tokenRes.json().catch(() => ({}))
  if (!tokenRes.ok) {
    const err = new Error(`Google recusou a renovação do token: ${tokenBody.error_description || tokenBody.error || tokenRes.status} — reconecte o canal em Integrações.`)
    err.status = 401
    throw err
  }

  try {
    await upsertCommand(
      'integracoes_tokens',
      {
        provider: 'youtube',
        access_token_enc: encrypt(tokenBody.access_token),
        expires_at: tokenBody.expires_in ? new Date(Date.now() + tokenBody.expires_in * 1000).toISOString() : null,
      },
      'provider',
    )
  } catch (e) {
    const err = new Error(`${MIGRATION_HINT} (${e.message})`)
    err.status = 503
    throw err
  }

  return tokenBody.access_token
}

/**
 * Upload multipart real (metadados JSON + binário do vídeo) — sem SDK, corpo
 * multipart/related montado à mão com um boundary aleatório, mesmo espírito
 * zero-dependência do resto do Core. `privacyStatus` vem "private" por
 * padrão de propósito: o agente publica no canal do Founder, mas não torna o
 * vídeo público sozinho — ele decide isso manualmente no Studio antes de
 * divulgar. Devolve o id do vídeo criado.
 */
export async function uploadVideo({ accessToken, title, description, tags, videoBuffer, mimeType = 'video/mp4', privacyStatus = 'private' }) {
  if (!accessToken) throw new Error('uploadVideo: accessToken é obrigatório')
  if (!Buffer.isBuffer(videoBuffer) || videoBuffer.length === 0) throw new Error('uploadVideo: videoBuffer vazio')

  const boundary = `kairos-${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`
  const metadata = {
    snippet: { title: String(title || '').slice(0, 100), description: description || '', tags: Array.isArray(tags) ? tags.slice(0, 30) : undefined },
    status: { privacyStatus },
  }
  const preamble = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`
  const closing = `\r\n--${boundary}--`
  const body = Buffer.concat([Buffer.from(preamble, 'utf8'), videoBuffer, Buffer.from(closing, 'utf8')])

  const res = await fetch(UPLOAD_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': `multipart/related; boundary=${boundary}` },
    body,
  })
  const text = await res.text()
  let json
  try { json = JSON.parse(text) } catch { json = null }
  if (!res.ok || !json?.id) {
    const msg = (json && json.error && json.error.message) || text.slice(0, 200) || `HTTP ${res.status}`
    const err = new Error(`youtube upload: ${msg}`)
    err.status = res.status && res.status >= 400 && res.status < 600 ? res.status : 502
    throw err
  }
  return { videoId: json.id }
}

// Exportado só para os testes conseguirem decifrar o que `completeConnection`
// gravaria, sem duplicar a lógica de cifra em lugar nenhum.
export const _internals = { decrypt }
