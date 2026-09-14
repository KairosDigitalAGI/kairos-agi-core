// Provider OPENROUTER — reserva de ÚLTIMO CASO. Os agentes que operam a empresa
// devem usar os planos pagos já assinados (Anthropic/Claude, OpenAI/GPT — ver claude.js
// e openai.js); OpenRouter só entra quando nenhum dos dois está configurado ou falha
// (decisão do Founder, 14/09/2026 — ver docs/context/MASTER_CONTEXT.md).
// Credencial: OPENROUTER_API_KEY. NUNCA hardcode.
// Contrato: chat({system, messages, maxTokens, model}) → {text, usage, model, stopReason}
export const name = 'openrouter'
export const BASE = 'https://openrouter.ai/api/v1'
export const MODEL = process.env.OPENROUTER_MODEL || 'mistralai/mistral-small-3.2-24b-instruct:free'

export function hasCredentials() {
  return Boolean(process.env.OPENROUTER_API_KEY)
}

export async function chat({ system, messages, maxTokens = 800, model = MODEL }) {
  const key = process.env.OPENROUTER_API_KEY
  if (!key) throw new Error('OPENROUTER_API_KEY não configurada')
  if (!Array.isArray(messages) || messages.length === 0) throw new Error('openrouter chat: messages vazio')
  const res = await fetch(`${BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://kairos-agi-core.vercel.app',
      'X-Title': 'Kairos AGI Core',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [{ role: 'system', content: system }, ...messages.map((m) => ({ role: m.role, content: String(m.content) }))],
    }),
  })
  const text = await res.text()
  let json
  try { json = JSON.parse(text) } catch { json = null }
  if (!res.ok || (json && json.error)) {
    const msg = (json && json.error && json.error.message) || text.slice(0, 200) || `HTTP ${res.status}`
    const err = new Error(`openrouter: ${msg}`)
    err.status = res.status
    throw err
  }
  const choice = (json.choices || [])[0] || {}
  const content = choice.message?.content
  const out = typeof content === 'string' ? content : Array.isArray(content) ? content.map((c) => c.text || '').join('') : ''
  return {
    text: out,
    usage: { inputTokens: json.usage?.prompt_tokens ?? 0, outputTokens: json.usage?.completion_tokens ?? 0 },
    model: json.model || model,
    stopReason: choice.finish_reason || null,
  }
}
