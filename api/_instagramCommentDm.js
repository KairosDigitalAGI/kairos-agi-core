// Private Reply: quem comenta a palavra-chave de uma regra aprovada recebe
// uma mensagem no Direct. O texto vem da OpenRouter com fallback fixo; links
// nunca vêm do modelo — só o KAIROS_WHATSAPP_URL configurado pelo Founder.
import { chat, hasCredentials } from './_providers/openrouter.js'

const MAX_DM = 900
const LLM_TIMEOUT_MS = 6000
const DEFAULT_FALLBACK = 'Oi! Aqui é o Kairos, da Kairos Digital. Obrigado pelo comentário! Eu sou um agente de IA que atende, qualifica e conduz vendas no WhatsApp 24 horas por dia. Quer ver como eu funcionaria no seu negócio?'

export function commentDmEnabled() {
  return process.env.KAIROS_IG_COMMENT_DM_ENABLED === 'true'
}

function withLink(text) {
  const url = String(process.env.KAIROS_WHATSAPP_URL || '').trim()
  return /^https:\/\/(wa\.me|api\.whatsapp\.com)\//.test(url) ? `${text}\n\n👉 Fale com o Kairos no WhatsApp: ${url}` : text
}

function fallbackText() {
  const custom = String(process.env.KAIROS_IG_COMMENT_DM_FALLBACK || '').trim()
  return custom && custom.length <= 600 ? custom : DEFAULT_FALLBACK
}

export function sanitizeDm(text) {
  const clean = String(text || '').replace(/\s+\n/g, '\n').trim()
  if (!clean || clean.length > 600) return null
  if (/https?:\/\/|www\.|\.com\b|#\w|@\w|R\$\s?\d|\d+\s?%/i.test(clean)) return null
  return clean
}

export async function composeCommentDm({ comment, username }) {
  if (!hasCredentials()) return { text: withLink(fallbackText()), source: 'fallback' }
  let timer
  try {
    const result = await Promise.race([
      chat({
        system: 'Você é o Kairos, agente de IA da Kairos Digital. Uma pessoa comentou a palavra KAIROS num Reels e vai receber esta mensagem no Direct do Instagram. Escreva em português do Brasil, 2 a 3 frases curtas, tom caloroso e confiante: agradeça o comentário, diga em uma frase que o Kairos é um agente de IA que atende, qualifica e conduz vendas no WhatsApp 24 horas por dia, e convide a pessoa a ver como funcionaria no negócio dela. Não invente preços, prazos, métricas, resultados, clientes ou promessas. Não inclua links, hashtags, arrobas ou dados pessoais. Responda só com a mensagem.',
        messages: [{ role: 'user', content: `Comentário${username ? ` de @${username}` : ''}: ${String(comment).slice(0, 300)}` }],
        maxTokens: 220,
      }),
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('timeout')), LLM_TIMEOUT_MS) }),
    ])
    const text = sanitizeDm(result?.text)
    if (text) return { text: withLink(text), source: 'openrouter' }
  } catch {} finally { clearTimeout(timer) }
  return { text: withLink(fallbackText()), source: 'fallback' }
}

export async function sendPrivateReply({ accessToken, igUserId, commentId, text }) {
  if (!text || text.length > MAX_DM) throw new Error('Mensagem do Direct inválida.')
  const response = await fetch(`https://graph.instagram.com/${encodeURIComponent(igUserId)}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipient: { comment_id: commentId }, message: { text } }),
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok || !(body.message_id || body.id)) throw new Error(`Instagram recusou o Direct: ${body.error?.message || response.status}`)
  return String(body.message_id || body.id)
}
