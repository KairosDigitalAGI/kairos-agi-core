// POST /api/content-jobs/approve — o Founder aprova explicitamente o gasto de
// geração paga de UM job (grava aprovado:true/aprovado_por/aprovado_em).
// Passo separado do "Gerar roteiro": o próprio schema (comentário em
// command.content_assets.gratuito, migration 0020) exige aprovado:true antes
// de qualquer chamada a provider pago — não basta o clique de gerar sozinho.
import { checkAuth, unauthorized } from '../_auth.js'
import { approveContentJob } from '../_content.js'

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
    const job = await approveContentJob({ jobId, aprovadoPor: 'founder' })
    return res.status(200).json({ job })
  } catch (e) {
    return res.status(e.status || 500).json({ erro: e.message })
  }
}
