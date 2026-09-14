// Provider VEO (Google, via AI Studio) — Missão 006, Fase 7, motor GRATUITO
// padrão de geração de vídeo. Credencial: GOOGLE_AI_KEY — chave de API do AI
// Studio, diferente de GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET (esses são do
// OAuth do YouTube, Fase 4; não confundir os dois "Google" deste Core).
//
// Assíncrono: dispara a geração e faz polling da operação até terminar.
// Contrato desenhado a partir da especificação passada pelo Founder; como
// nenhuma chamada real foi feita ainda (sem GOOGLE_AI_KEY nesta sessão),
// qualquer resposta fora do formato esperado falha fechado (nunca inventa
// uma URL de vídeo) em vez de assumir sucesso.
export const name = 'veo'
export const MODEL = process.env.GOOGLE_VEO_MODEL || 'veo-2.0-flash-exp'

const BASE = 'https://generativelanguage.googleapis.com/v1beta'

// Lidos a cada chamada (não numa const de módulo) para que os testes
// consigam acelerar o polling via env var sem depender da ordem de import.
function pollIntervalMs() {
  return Number(process.env.VEO_POLL_INTERVAL_MS) || 5000
}
function pollTimeoutMs() {
  return Number(process.env.VEO_POLL_TIMEOUT_MS) || 5 * 60 * 1000
}

export function hasCredentials() {
  return Boolean(process.env.GOOGLE_AI_KEY)
}

function operationDone(op) {
  return op?.done === true || op?.state === 'DONE' || op?.metadata?.state === 'DONE'
}

export async function generateVideo({ prompt, durationSeconds = 5, aspectRatio = '9:16', model = MODEL }) {
  const key = process.env.GOOGLE_AI_KEY
  if (!key) throw new Error('GOOGLE_AI_KEY não configurada')
  if (typeof prompt !== 'string' || !prompt.trim()) throw new Error('veo generateVideo: prompt vazio')

  const startRes = await fetch(`${BASE}/models/${model}:generateVideo`, {
    method: 'POST',
    headers: { 'x-goog-api-key': key, 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, durationSeconds, aspectRatio }),
  })
  const startText = await startRes.text()
  let op
  try { op = JSON.parse(startText) } catch { op = null }
  if (!startRes.ok || !op) {
    const msg = (op && op.error && op.error.message) || startText.slice(0, 200) || `HTTP ${startRes.status}`
    const err = new Error(`veo: ${msg}`)
    err.status = startRes.status
    throw err
  }
  const opName = op.name
  if (!opName) throw new Error('veo generateVideo: resposta sem operação (name ausente)')

  const startedAt = Date.now()
  while (!operationDone(op)) {
    if (Date.now() - startedAt > pollTimeoutMs()) {
      const err = new Error('veo generateVideo: tempo de espera esgotado aguardando a operação terminar')
      err.status = 504
      throw err
    }
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs()))
    const pollRes = await fetch(`${BASE}/${opName}`, { headers: { 'x-goog-api-key': key } })
    const pollText = await pollRes.text()
    try { op = JSON.parse(pollText) } catch { op = null }
    if (!pollRes.ok || !op) {
      const err = new Error(`veo: falha ao consultar a operação (${pollRes.status})`)
      err.status = pollRes.status
      throw err
    }
  }

  if (op.error) {
    const err = new Error(`veo: ${op.error.message || 'a operação terminou com erro'}`)
    err.status = 502
    throw err
  }

  const uri =
    op.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri ||
    op.response?.generatedSamples?.[0]?.video?.uri
  if (!uri) throw new Error('veo generateVideo: resposta sem vídeo (uri ausente)')
  return { url: uri, model }
}
