// POST /api/content-jobs/post-youtube — o Founder aciona a publicação de UM
// job em etapa "video" no canal já conectado (Fase 4). Ação mais
// irreversível do pipeline: sobe o vídeo de verdade para o YouTube (como
// privado, ver api/_youtube.js#uploadVideo), então exige etapa="video" E
// aprovado:true — ver o comentário de api/_content.js#postToYoutube sobre
// por que reaproveita `aprovado` em vez de esperar a etapa "aprovacao"
// (legenda/aprovacao ainda não têm motor). Mesma Basic Auth das outras rotas.
import { checkAuth, unauthorized } from '../_auth.js'
import { postToYoutube } from '../_content.js'

export default async function handler(req, res) {
  if (!checkAuth(req)) return unauthorized(res)
  res.setHeader('Cache-Control', 'no-store')

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ erro: 'use POST' })
  }

  const jobId = typeof req.body?.jobId === 'string' ? req.body.jobId.trim() : ''
  if (!jobId) return res.status(400).json({ erro: 'jobId é obrigatório' })
  const { title, description, tags } = req.body || {}

  try {
    const { job, videoId } = await postToYoutube({ jobId, title, description, tags })
    return res.status(200).json({ job, videoId })
  } catch (e) {
    return res.status(e.status || 500).json({ erro: e.message })
  }
}
