// Provider CLAUDE (Anthropic) — chamada direta à Messages API por fetch, sem SDK
// (mesmo espírito zero-dependência do sidecar/api/_command.js deste repo).
// Credencial: ANTHROPIC_API_KEY. NUNCA hardcode, nunca aparece no cliente — só roda aqui, server-side.
// Contrato: chat({system, messages, maxTokens, model}) → {text, usage, model, stopReason}
export const name = 'claude'
export const MODEL = process.env.ANTHROPIC_CHAT_MODEL || 'claude-sonnet-5'

export function hasCredentials() {
  return Boolean(process.env.ANTHROPIC_API_KEY)
}

export async function chat({ system, messages, maxTokens = 800, model = MODEL }) {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) throw new Error('ANTHROPIC_API_KEY não configurada')
  if (!Array.isArray(messages) || messages.length === 0) throw new Error('claude chat: messages vazio')
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system,
      messages: messages.map((m) => ({ role: m.role, content: String(m.content) })),
    }),
  })
  const text = await res.text()
  let json
  try { json = JSON.parse(text) } catch { json = null }
  if (!res.ok || (json && json.error)) {
    const msg = (json && json.error && json.error.message) || text.slice(0, 200) || `HTTP ${res.status}`
    const err = new Error(`claude: ${msg}`)
    err.status = res.status
    throw err
  }
  const content = (json.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('')
  return {
    text: content,
    usage: { inputTokens: json.usage?.input_tokens ?? 0, outputTokens: json.usage?.output_tokens ?? 0 },
    model: json.model || model,
    stopReason: json.stop_reason || null,
  }
}
