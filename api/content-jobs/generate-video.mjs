// POST /api/content-jobs/generate-video — o Founder aciona a geração de vídeo
// de UM job específico (etapa imagem → video). Mesma Basic Auth do Painel
// Operacional. `tier` escolhe o motor: "free" (Veo → fallback Kling v1.6,
// padrão) ou "paid" (Kling v2.1 Master, exige aprovado:true). Ver
// api/_content.js#generateVideo para o roteamento completo.
import { checkAuth, unauthorized } from '../_auth.js'
import { generateVideo } from '../_content.js'

export default async function handler(req, res) {
  if (!checkAuth(req)) return unauthorized(res)
  res.setHeader('Cache-Control', 'no-store')

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ erro: 'use POST' })
  }

  const jobId = typeof req.body?.jobId === 'string' ? req.body.jobId.trim() : ''
  if (!jobId) return res.status(400).json({ erro: 'jobId é obrigatório' })
  const tier = req.body?.tier === 'paid' ? 'paid' : 'free'

  try {
    const { job, asset } = await generateVideo({ jobId, tier })
    return res.status(200).json({ job, asset })
  } catch (e) {
    return res.status(e.status || 500).json({ erro: e.message })
  }
}
