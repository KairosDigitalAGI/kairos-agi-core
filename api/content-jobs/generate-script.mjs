// POST /api/content-jobs/generate-script — o Founder aciona a geração do
// roteiro de UM job específico (etapa ideia → roteiro). Mesma Basic Auth do
// Painel Operacional. Chama um provider pago (Anthropic/OpenAI, prioridade
// da Fase 2) só neste clique — nunca em lote, nunca sozinho.
import { checkAuth, unauthorized } from '../_auth.js'
import { generateScript } from '../_content.js'

export default async function handler(req, res) {
  if (!checkAuth(req)) return unauthorized(res)
  res.setHeader('Cache-Control', 'no-store')

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ erro: 'use POST' })
  }

  const jobId = typeof req.body?.jobId === 'string' ? req.body.jobId.trim() : ''
  if (!jobId) return res.status(400).json({ erro: 'jobId é obrigatório' })

  try {
    const { job, asset } = await generateScript({ jobId })
    return res.status(200).json({ job, asset })
  } catch (e) {
    return res.status(e.status || 500).json({ erro: e.message })
  }
}
