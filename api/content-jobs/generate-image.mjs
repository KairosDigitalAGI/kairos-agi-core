// POST /api/content-jobs/generate-image — o Founder aciona a geração da
// imagem de capa de UM job específico (etapa roteiro → imagem). Mesma Basic
// Auth do Painel Operacional. Chama a OpenAI (única com geração de imagem
// neste Core) só neste clique — nunca em lote, nunca sozinho.
import { checkAuth, unauthorized } from '../_auth.js'
import { generateImage } from '../_content.js'

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
    const { job, asset } = await generateImage({ jobId })
    return res.status(200).json({ job, asset })
  } catch (e) {
    return res.status(e.status || 500).json({ erro: e.message })
  }
}
