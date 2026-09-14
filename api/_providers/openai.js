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

// Geração de imagem — só a OpenAI tem esse recurso entre os providers deste
// Core (Claude/Anthropic não gera imagem). Sem fallback de provider aqui:
// quem chama decide o que fazer se OPENAI_API_KEY não estiver configurada.
// Contrato: generateImage({prompt, size}) → {b64, model}
export const IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1'

export async function generateImage({ prompt, size = '1024x1024', model = IMAGE_MODEL }) {
  const key = process.env.OPENAI_API_KEY
  if (!key) throw new Error('OPENAI_API_KEY não configurada')
  if (typeof prompt !== 'string' || !prompt.trim()) throw new Error('openai generateImage: prompt vazio')
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model, prompt, size, n: 1 }),
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
  const b64 = json.data?.[0]?.b64_json
  if (!b64) throw new Error('openai generateImage: resposta sem imagem (b64_json ausente)')
  return { b64, model: json.model || model }
}
