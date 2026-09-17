// Webhook receptor do Instagram (Meta Graph API).
// GET  → verificação do endpoint (hub.verify_token)
// POST → eventos de comentário e DM → IA → resposta automática
//
// Precisa de bodyParser: false para verificar a assinatura HMAC-SHA256 do Meta
// (X-Hub-Signature-256) contra o corpo bruto antes de parsear o JSON.
// ENV obrigatórias: META_WEBHOOK_VERIFY_TOKEN, META_APP_SECRET + credenciais LLM.
export const config = { api: { bodyParser: false } }

import { createHmac, timingSafeEqual } from 'node:crypto'
import {
  getValidInstagramAccess,
  replyToComment,
  sendDirectMessage,
  getAutomationConfig,
  logAutomationReply,
} from '../../_instagram.js'
import { selectProvider } from '../../_providers/index.js'

const KAIROS_SYSTEM_PROMPT = `Você é o assistente digital da Kairos Digital, empresa brasileira especializada em automação com IA para pequenas e médias empresas.
Responda de forma amigável, profissional e concisa em português brasileiro.
Objetivo: qualificar o interesse do lead e direcioná-lo para falar com um especialista da Kairos.
Nunca invente preços, prazos ou funcionalidades técnicas. Máximo 2 a 3 frases por resposta.`

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

function verifySignature(rawBody, signatureHeader) {
  const secret = process.env.META_APP_SECRET
  if (!secret || !signatureHeader) return false
  const sig = signatureHeader.replace('sha256=', '')
  try {
    const expected = createHmac('sha256', secret).update(rawBody).digest('hex')
    if (sig.length !== expected.length) return false
    return timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'))
  } catch {
    return false
  }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')

  // GET: verificação do endpoint pelo Meta
  if (req.method === 'GET') {
    const url = new URL(req.url, 'http://localhost')
    const mode = url.searchParams.get('hub.mode')
    const token = url.searchParams.get('hub.verify_token')
    const challenge = url.searchParams.get('hub.challenge')
    const expected = process.env.META_WEBHOOK_VERIFY_TOKEN
    if (!expected) return res.status(503).json({ erro: 'META_WEBHOOK_VERIFY_TOKEN não configurada' })
    if (mode === 'subscribe' && token === expected) return res.status(200).send(challenge)
    return res.status(403).json({ erro: 'verify_token inválido' })
  }

  if (req.method !== 'POST') return res.status(405).end()

  // POST: entrega de eventos
  const rawBody = await getRawBody(req)
  if (!verifySignature(rawBody, req.headers['x-hub-signature-256'])) {
    return res.status(403).json({ erro: 'assinatura inválida' })
  }

  let event
  try { event = JSON.parse(rawBody.toString('utf8')) } catch { return res.status(400).json({ erro: 'JSON inválido' }) }

  // Ignora objetos que não sejam instagram (Meta manda instagram e page)
  if (event.object !== 'instagram') return res.status(200).json({ ok: true, skipped: true })

  // Processa antes de responder (Meta tolera ~20s; LLM pequeno + 1 chamada de API ≈ 3-5s)
  await processEvent(event)

  return res.status(200).json({ ok: true })
}

async function processEvent(event) {
  const automationConfig = await getAutomationConfig()
  if (!automationConfig?.enabled) return

  let accessToken, igUserId
  try {
    ;({ accessToken, igUserId } = await getValidInstagramAccess())
  } catch {
    return // sem token, nada a fazer
  }

  const promptBase = automationConfig.prompt_base || KAIROS_SYSTEM_PROMPT
  const provider = selectProvider()

  for (const entry of event.entry || []) {
    // Comentários em publicações
    for (const change of entry.changes || []) {
      if (change.field === 'comments' && change.value) {
        await handleComment({ accessToken, value: change.value, promptBase, provider })
      }
    }
    // DMs via Instagram Messaging
    for (const msg of entry.messaging || []) {
      if (msg.message && !msg.message.is_echo) {
        await handleDM({ accessToken, igUserId, msg, promptBase, provider })
      }
    }
  }
}

async function handleComment({ accessToken, value, promptBase, provider }) {
  const commentId = value.id
  const text = value.text || ''
  const from = value.from?.username || value.from?.name || 'usuário'
  if (!commentId || !text.trim()) return

  let responseText
  try {
    const result = await provider.chat({
      system: promptBase,
      messages: [{ role: 'user', content: `Comentário de @${from}: "${text}"` }],
      maxTokens: 300,
    })
    responseText = result.text?.trim()
  } catch (e) {
    await logAutomationReply({ type: 'comment', incomingId: commentId, incomingText: text, response: null, error: e.message })
    return
  }

  if (!responseText) {
    await logAutomationReply({ type: 'comment', incomingId: commentId, incomingText: text, response: null, error: 'resposta vazia do LLM' })
    return
  }

  try {
    await replyToComment({ accessToken, commentId, message: responseText })
    await logAutomationReply({ type: 'comment', incomingId: commentId, incomingText: text, response: responseText, error: null })
  } catch (e) {
    await logAutomationReply({ type: 'comment', incomingId: commentId, incomingText: text, response: responseText, error: e.message })
  }
}

async function handleDM({ accessToken, igUserId, msg, promptBase, provider }) {
  const senderId = msg.sender?.id
  const text = msg.message?.text || ''
  if (!senderId || !text.trim()) return

  let responseText
  try {
    const result = await provider.chat({
      system: promptBase,
      messages: [{ role: 'user', content: text }],
      maxTokens: 300,
    })
    responseText = result.text?.trim()
  } catch (e) {
    await logAutomationReply({ type: 'dm', incomingId: senderId, incomingText: text, response: null, error: e.message })
    return
  }

  if (!responseText) {
    await logAutomationReply({ type: 'dm', incomingId: senderId, incomingText: text, response: null, error: 'resposta vazia do LLM' })
    return
  }

  try {
    await sendDirectMessage({ accessToken, igUserId, recipientId: senderId, message: responseText })
    await logAutomationReply({ type: 'dm', incomingId: senderId, incomingText: text, response: responseText, error: null })
  } catch (e) {
    await logAutomationReply({ type: 'dm', incomingId: senderId, incomingText: text, response: responseText, error: e.message })
  }
}
