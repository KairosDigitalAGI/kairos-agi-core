// Provider FAL (fal.ai) — Kling Video. Missão 006, Fase 7. Duas funções no
// mesmo motor, escolhidas pelo `model` que quem chama passa:
//  - MODEL_FREE  (Kling v1.6 standard): fallback gratuito do Veo, quando a
//    cota do Veo esgota (429) ou GOOGLE_AI_KEY não está configurada.
//  - MODEL_PAID  (Kling v2.1 Master): motor pago, só usado com
//    content_jobs.aprovado:true (gate aplicado em api/_content.js, não aqui).
// Credencial: FAL_KEY, server-side only — nunca aparece no cliente.
//
// fal.ai é fila assíncrona: submete, faz polling do status e busca o
// resultado quando completa. Zero dependência — só fetch nativo.
export const name = 'fal'

const BASE = 'https://queue.fal.run'

// Lidos a cada chamada (não numa const de módulo) para que os testes
// consigam acelerar o polling via env var sem depender da ordem de import.
function pollIntervalMs() {
  return Number(process.env.FAL_POLL_INTERVAL_MS) || 5000
}
function pollTimeoutMs() {
  return Number(process.env.FAL_POLL_TIMEOUT_MS) || 8 * 60 * 1000
}

export const MODEL_FREE = 'fal-ai/kling-video/v1.6/standard/text-to-video'
export const MODEL_PAID = 'fal-ai/kling-video/v2.1/master'

export function hasCredentials() {
  return Boolean(process.env.FAL_KEY)
}

export async function generateVideo({ prompt, model, aspectRatio = '9:16', duration }) {
  const key = process.env.FAL_KEY
  if (!key) throw new Error('FAL_KEY não configurada')
  if (typeof prompt !== 'string' || !prompt.trim()) throw new Error('fal generateVideo: prompt vazio')
  if (typeof model !== 'string' || !model.trim()) throw new Error('fal generateVideo: model é obrigatório')

  const submitRes = await fetch(`${BASE}/${model}`, {
    method: 'POST',
    headers: { Authorization: `Key ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, aspect_ratio: aspectRatio, ...(duration ? { duration: String(duration) } : {}) }),
  })
  const submitText = await submitRes.text()
  let job
  try { job = JSON.parse(submitText) } catch { job = null }
  if (!submitRes.ok || !job) {
    const msg = (job && (job.detail || job.error)) || submitText.slice(0, 200) || `HTTP ${submitRes.status}`
    const err = new Error(`fal: ${msg}`)
    err.status = submitRes.status
    throw err
  }

  const statusUrl = job.status_url
  const responseUrl = job.response_url
  if (!statusUrl || !responseUrl) throw new Error('fal generateVideo: resposta sem status_url/response_url')

  const startedAt = Date.now()
  let status = job.status
  while (status !== 'COMPLETED') {
    if (status === 'FAILED' || status === 'ERROR') {
      const err = new Error('fal generateVideo: a fila reportou falha na geração')
      err.status = 502
      throw err
    }
    if (Date.now() - startedAt > pollTimeoutMs()) {
      const err = new Error('fal generateVideo: tempo de espera esgotado aguardando a fila')
      err.status = 504
      throw err
    }
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs()))
    const pollRes = await fetch(statusUrl, { headers: { Authorization: `Key ${key}` } })
    const pollJson = await pollRes.json().catch(() => null)
    if (!pollRes.ok || !pollJson) {
      const err = new Error(`fal: falha ao consultar status (${pollRes.status})`)
      err.status = pollRes.status
      throw err
    }
    status = pollJson.status
  }

  const resultRes = await fetch(responseUrl, { headers: { Authorization: `Key ${key}` } })
  const resultJson = await resultRes.json().catch(() => null)
  if (!resultRes.ok || !resultJson) {
    const err = new Error(`fal: falha ao buscar o resultado (${resultRes.status})`)
    err.status = resultRes.status
    throw err
  }
  const url = resultJson.video?.url
  if (!url) throw new Error('fal generateVideo: resposta sem vídeo (video.url ausente)')
  return { url, model }
}
