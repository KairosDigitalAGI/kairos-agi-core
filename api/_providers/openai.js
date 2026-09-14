// Provider OPENAI (GPT) — Chat Completions API por fetch, sem SDK.
// Credencial: OPENAI_API_KEY. NUNCA hardcode, nunca aparece no cliente — só roda aqui, server-side.
// Contrato: chat({system, messages, maxTokens, model}) → {text, usage, model, stopReason}
export const name = 'openai'
export const MODEL = process.env.OPENAI_CHAT_MODEL || 'gpt-5.1'

export function hasCredentials() {
  return Boolean(process.env.OPENAI_API_KEY)
}

export async function chat({ system, messages, maxTokens = 800, model = MODEL }) {
  const key = process.env.OPENAI_API_KEY
  if (!key) throw new Error('OPENAI_API_KEY não configurada')
  if (!Array.isArray(messages) || messages.length === 0) throw new Error('openai chat: messages vazio')
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_completion_tokens: maxTokens,
      messages: [{ role: 'system', content: system }, ...messages.map((m) => ({ role: m.role, content: String(m.content) }))],
    }),
  })
  const text = await res.text()
  let json
  try { json = JSON.parse(text) } catch { json = null }
  if (!res.ok || (json && json.error)) {
    const msg = (json && json.error && json.error.message) || text.slice(0, 200) || `HTTP ${res.status}`
    const err = new Error(`openai: ${msg}`)
    err.status = res.status
    throw err
  }
  const choice = (json.choices || [])[0] || {}
  return {
    text: choice.message?.content || '',
    usage: { inputTokens: json.usage?.prompt_tokens ?? 0, outputTokens: json.usage?.completion_tokens ?? 0 },
    model: json.model || model,
    stopReason: choice.finish_reason || null,
  }
}
