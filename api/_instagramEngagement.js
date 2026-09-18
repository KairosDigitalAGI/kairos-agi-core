// Instagram Login: recebe eventos oficiais, responde por regras keyword OU por IA livre.
// O webhook nunca usa Basic Auth; a assinatura X-Hub-Signature-256 autentica cada payload.
import { createHmac, timingSafeEqual } from 'node:crypto'
import { readCommand, writeCommand, patchCommand } from './_command.js'
import { getValidInstagramAccess } from './_instagram.js'
import { selectProvider } from './_providers/index.js'

const DEFAULT_IG_SYSTEM_PROMPT = `Você é o assistente digital da Kairos Digital, empresa brasileira especializada em automação com IA para pequenas e médias empresas.
Responda de forma amigável, profissional e concisa em português brasileiro.
Objetivo: qualificar o interesse do lead e direcioná-lo para uma conversa com um especialista da Kairos Digital.
Nunca invente preços, prazos ou funcionalidades técnicas específicas.
Máximo 2 a 3 frases por resposta. Seja direto e útil.`

const MAX_BODY = 256 * 1024
const MAX_REPLY = 500
const MIGRATION_HINT = 'Aplique supabase/migrations/0025_instagram_engagement.sql no Supabase mestre.'

function fail(message, status = 400) {
  const error = new Error(message)
  error.status = status
  return error
}

export function verifyWebhookChallenge(query) {
  const token = process.env.META_WEBHOOK_VERIFY_TOKEN
  if (!token) throw fail('META_WEBHOOK_VERIFY_TOKEN ausente.', 503)
  const submitted = String(query?.['hub.verify_token'] || '')
  const a = Buffer.from(token)
  const b = Buffer.from(submitted)
  if (query?.['hub.mode'] !== 'subscribe' || !submitted || a.length !== b.length || !timingSafeEqual(a, b)) {
    throw fail('Verificação do webhook recusada.', 403)
  }
  return String(query['hub.challenge'] || '')
}

export async function readWebhookBody(req) {
  // Vercel expõe req.body por um getter que consome e parseia o stream.
  // Nunca acessar esse getter em uma requisição HTTP real.
  if (typeof req[Symbol.asyncIterator] !== 'function') {
    if (Buffer.isBuffer(req.body)) return req.body
    if (typeof req.body === 'string') return Buffer.from(req.body)
    throw fail('O corpo bruto do webhook não está disponível.', 503)
  }
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > MAX_BODY) throw fail('Evento acima do limite.', 413)
    chunks.push(chunk)
  }
  return Buffer.concat(chunks)
}

export function parseSignedWebhook(raw, signature) {
  const secret = process.env.META_APP_SECRET
  if (!secret) throw fail('META_APP_SECRET ausente.', 503)
  if (!Buffer.isBuffer(raw) || raw.length > MAX_BODY) throw fail('Evento inválido.', 413)
  const expected = `sha256=${createHmac('sha256', secret).update(raw).digest('hex')}`
  const actual = String(signature || '')
  const a = Buffer.from(expected)
  const b = Buffer.from(actual)
  if (a.length !== b.length || !timingSafeEqual(a, b)) throw fail('Assinatura do webhook inválida.', 403)
  let payload
  try { payload = JSON.parse(raw.toString('utf8')) } catch { throw fail('JSON inválido.') }
  if (payload?.object !== 'instagram') throw fail('Objeto de webhook inesperado.')
  return payload
}

export async function handleInstagramWebhook(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  try {
    if (req.method === 'GET') return res.status(200).send(verifyWebhookChallenge(req.query))
    if (req.method !== 'POST') return res.status(405).json({ erro: 'use GET ou POST' })
    const raw = await readWebhookBody(req)
    const payload = parseSignedWebhook(raw, req.headers['x-hub-signature-256'])
    return res.status(200).json(await receiveInstagramWebhook(payload))
  } catch (error) {
    return res.status(error.status || 500).json({ erro: error.message })
  }
}

export function normalizeInstagramEvents(payload) {
  const result = []
  for (const entry of payload.entry || []) {
    const accountId = String(entry.id || '')
    const entryTime = Number(entry.time) > 0 ? new Date(Number(entry.time) * 1000).toISOString() : null
    for (const change of entry.changes || []) {
      if (change.field !== 'comments' || !change.value?.id) continue
      const value = change.value
      if (!value.from?.id || !value.text) continue
      result.push({
        event_key: `comment:${value.id}`, kind: 'comment', account_id: accountId,
        source_id: String(value.id), sender_id: String(value.from.id),
        sender_username: String(value.from.username || '').slice(0, 100) || null,
        content: String(value.text).slice(0, 2000), media_id: String(value.media?.id || '') || null,
        event_time: entryTime,
      })
    }
    for (const event of entry.messaging || []) {
      if (!event.message?.mid || !event.message?.text || event.message.is_echo) continue
      if (!event.sender?.id || !event.recipient?.id) continue
      result.push({
        event_key: `message:${event.message.mid}`, kind: 'message', account_id: accountId,
        source_id: String(event.message.mid), sender_id: String(event.sender.id),
        sender_username: null, content: String(event.message.text).slice(0, 2000), media_id: null,
        event_time: Number(event.timestamp) > 0 ? new Date(Number(event.timestamp)).toISOString() : null,
      })
    }
  }
  return result.slice(0, 50)
}

async function connectedAccountId() {
  const accounts = await readCommand('integracoes_tokens', '?select=account_id&provider=eq.instagram&limit=1')
  const accountId = String(accounts?.[0]?.account_id || '')
  if (!accountId) throw fail('Instagram desconectado.', 503)
  return accountId
}

function matchRule(event, rules) {
  if (event.kind === 'message') {
    if (!withinMessageWindow(event.event_time)) return null
  }
  const content = event.content.normalize('NFKC').toLocaleLowerCase('pt-BR')
  return rules.find(rule => rule.enabled && rule.approved_at && rule.kind === event.kind &&
    rule.keyword && content.includes(String(rule.keyword).normalize('NFKC').toLocaleLowerCase('pt-BR')))
}

function withinMessageWindow(timestamp) {
  const age = Date.now() - new Date(timestamp || 0).getTime()
  return Number.isFinite(age) && age >= 0 && age <= 24 * 60 * 60 * 1000
}

async function sendReply(event, text) {
  const { accessToken, igUserId } = await getValidInstagramAccess()
  if (String(igUserId) !== String(event.account_id)) throw fail('Evento de outra conta Instagram.', 403)
  let url, options
  if (event.kind === 'comment') {
    url = `https://graph.instagram.com/${encodeURIComponent(event.source_id)}/replies`
    options = { method: 'POST', body: new URLSearchParams({ message: text, access_token: accessToken }) }
  } else {
    url = `https://graph.instagram.com/${encodeURIComponent(igUserId)}/messages`
    options = { method: 'POST', headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipient: { id: event.sender_id }, message: { text } }) }
  }
  const response = await fetch(url, options)
  const body = await response.json().catch(() => ({}))
  if (!response.ok || !(body.id || body.message_id)) throw fail(`Instagram recusou a resposta: ${body.error?.message || response.status}`, 502)
  return String(body.id || body.message_id)
}

async function aiReply(event) {
  let provider
  try { provider = selectProvider() } catch { return null }
  const system = process.env.IG_AI_SYSTEM_PROMPT || DEFAULT_IG_SYSTEM_PROMPT
  const result = await provider.chat({ system, messages: [{ role: 'user', content: event.content }], maxTokens: 250 })
  const text = result.text?.trim()
  return text && text.length > 0 && text.length <= 500 ? text : null
}

async function deliver(event, text, ruleId = null) {
  if (!text || text.length > MAX_REPLY) throw fail(`Resposta deve ter 1 a ${MAX_REPLY} caracteres.`)
  // Mudança condicional: um webhook repetido ou dois operadores não enviam
  // a mesma resposta duas vezes. "sending" nunca é reenviado automaticamente.
  const locked = await patchCommand('instagram_engagement_events', `?event_key=eq.${encodeURIComponent(event.event_key)}&status=eq.pending`,
    { status: 'sending', reply_text: text, rule_id: ruleId })
  if (!locked?.length) return { status: 'already_handled' }
  try {
    const remoteId = await sendReply(event, text)
    await patchCommand('instagram_engagement_events', `?event_key=eq.${encodeURIComponent(event.event_key)}&status=eq.sending`,
      { status: 'sent', remote_reply_id: remoteId, sent_at: new Date().toISOString(), error: null })
    return { status: 'sent', remoteId }
  } catch (error) {
    // Não retentar no webhook: a Meta pode ter aceito antes de uma falha de
    // rede, e repetir poderia enviar uma segunda mensagem.
    await patchCommand('instagram_engagement_events', `?event_key=eq.${encodeURIComponent(event.event_key)}&status=eq.sending`,
      { status: 'review', error: String(error.message).slice(0, 300) }).catch(() => {})
    return { status: 'review' }
  }
}

export async function receiveInstagramWebhook(payload) {
  const events = normalizeInstagramEvents(payload)
  if (!events.length) return { received: 0 }
  const accountId = await connectedAccountId()
  const rules = await readCommand('instagram_automation_rules', `?select=id,kind,keyword,response_text,enabled,approved_at&account_id=eq.${encodeURIComponent(accountId)}&enabled=eq.true`)
  let received = 0
  for (const event of events) {
    if (event.account_id !== accountId || event.sender_id === accountId) continue
    try { await writeCommand('instagram_engagement_events', event) }
    catch (error) { if (/respondeu 409/.test(error.message)) continue; throw fail(`${MIGRATION_HINT} ${error.message}`, 503) }
    received += 1
    const rule = matchRule(event, rules || [])
    const cooldownKey = { account_id: accountId, sender_id: event.sender_id, kind: event.kind, day: new Date().toISOString().slice(0, 10) }
    // No máximo uma resposta automática por pessoa/canal/dia UTC.
    try {
      await writeCommand('instagram_engagement_cooldowns', cooldownKey)
    } catch (error) {
      if (/respondeu 409/.test(error.message)) continue
      throw fail(`${MIGRATION_HINT} ${error.message}`, 503)
    }
    if (rule) {
      await deliver(event, String(rule.response_text), rule.id)
    } else {
      // Sem regra keyword → resposta IA livre (requer provider LLM configurado).
      const text = await aiReply(event).catch(() => null)
      if (text) await deliver(event, text)
    }
  }
  return { received }
}

export async function listInstagramInbox() {
  try {
    const accountId = await connectedAccountId()
    const [events, rules] = await Promise.all([
      readCommand('instagram_engagement_events', `?select=event_key,kind,sender_username,content,status,reply_text,sent_at,error,created_at&account_id=eq.${encodeURIComponent(accountId)}&order=created_at.desc&limit=100`),
      readCommand('instagram_automation_rules', `?select=id,kind,keyword,response_text,enabled,approved_at,created_at&account_id=eq.${encodeURIComponent(accountId)}&order=created_at.desc&limit=100`),
    ])
    return { events: events || [], rules: rules || [] }
  } catch (error) { throw fail(`${MIGRATION_HINT} ${error.message}`, 503) }
}

export async function createInstagramRule(input) {
  const kind = input?.kind
  const keyword = String(input?.keyword || '').trim().slice(0, 80)
  const responseText = String(input?.responseText || '').trim()
  if (!['comment', 'message'].includes(kind) || keyword.length < 2 || !responseText || responseText.length > MAX_REPLY) {
    throw fail('Defina canal, palavra-chave (2–80 caracteres) e resposta (1–500 caracteres).')
  }
  const accountId = await connectedAccountId()
  const rows = await writeCommand('instagram_automation_rules', { account_id: accountId, kind, keyword, response_text: responseText, enabled: false })
  return rows?.[0]
}

export async function setInstagramRuleEnabled(input) {
  const id = String(input?.id || '')
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw fail('Regra inválida.')
  const accountId = await connectedAccountId()
  const enabled = input?.enabled === true
  const rows = await patchCommand('instagram_automation_rules', `?id=eq.${id}&account_id=eq.${encodeURIComponent(accountId)}`,
    { enabled, approved_at: enabled ? new Date().toISOString() : null })
  if (!rows?.length) throw fail('Regra não encontrada.', 404)
  return rows[0]
}

export async function replyToInstagramEvent(input) {
  const key = String(input?.eventKey || '')
  const text = String(input?.text || '').trim()
  if (!/^(comment|message):[A-Za-z0-9_\-:.]{1,200}$/.test(key)) throw fail('Evento inválido.')
  const accountId = await connectedAccountId()
  const rows = await readCommand('instagram_engagement_events', `?select=event_key,kind,account_id,source_id,sender_id,content,status,event_time&event_key=eq.${encodeURIComponent(key)}&account_id=eq.${encodeURIComponent(accountId)}&limit=1`)
  if (!rows?.length) throw fail('Evento não encontrado.', 404)
  if (rows[0].status !== 'pending') throw fail('Este evento já foi tratado ou precisa de revisão manual.', 409)
  if (rows[0].kind === 'message' && !withinMessageWindow(rows[0].event_time)) throw fail('A janela de 24 horas desta conversa terminou.', 409)
  return deliver(rows[0], text)
}
