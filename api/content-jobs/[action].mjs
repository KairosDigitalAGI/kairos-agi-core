// POST /api/content-jobs/{approve|generate-script|generate-image|generate-video|post-youtube}
//
// Consolidação de arquivo, não de comportamento: o plano Hobby da Vercel
// tem teto de 12 Serverless Functions por deployment. As Fases 7/8
// somaram generate-video.mjs + post-youtube.mjs às 12 rotas já existentes
// e o deploy passou a falhar com "No more than 12 Serverless Functions can
// be added". Em vez de pedir upgrade pra plano pago (decisão de gasto que
// exige aprovação explícita do Founder, mesma regra usada em toda geração
// paga deste Core) ou deixar o deploy quebrado, as cinco rotas de ação de
// job (`approve`, `generate-script`, `generate-image`, `generate-video`,
// `post-youtube`) foram fundidas neste único arquivo dinâmico. Cada
// `action` mantém exatamente a mesma URL, validação, Basic Auth e resposta
// que tinha como arquivo próprio — /api/content-jobs/approve continua
// respondendo em /api/content-jobs/approve, só que roteado por
// req.query.action em vez de por nome de arquivo. Nenhuma lógica de
// negócio mudou; toda ela continua em api/_content.js.
import { checkAuth, unauthorized } from '../_auth.js'
import {
  approveContentJob,
  generateImage,
  generateScript,
  generateVideo,
  postToYoutube,
  postToInstagram,
} from '../_content.js'

function jobIdFromBody(req) {
  return typeof req.body?.jobId === 'string' ? req.body.jobId.trim() : ''
}

const ACTIONS = {
  async approve(req) {
    const jobId = jobIdFromBody(req)
    if (!jobId) return { status: 400, body: { erro: 'jobId é obrigatório' } }
    const job = await approveContentJob({ jobId, aprovadoPor: 'founder' })
    return { status: 200, body: { job } }
  },

  async 'generate-script'(req) {
    const jobId = jobIdFromBody(req)
    if (!jobId) return { status: 400, body: { erro: 'jobId é obrigatório' } }
    const { job, asset } = await generateScript({ jobId })
    return { status: 200, body: { job, asset } }
  },

  async 'generate-image'(req) {
    const jobId = jobIdFromBody(req)
    if (!jobId) return { status: 400, body: { erro: 'jobId é obrigatório' } }
    const { job, asset } = await generateImage({ jobId })
    return { status: 200, body: { job, asset } }
  },

  async 'generate-video'(req) {
    const jobId = jobIdFromBody(req)
    if (!jobId) return { status: 400, body: { erro: 'jobId é obrigatório' } }
    const tier = req.body?.tier === 'paid' ? 'paid' : req.body?.tier === 'gateway' ? 'gateway' : 'free'
    const { job, asset } = await generateVideo({ jobId, tier })
    return { status: 200, body: { job, asset } }
  },

  async 'post-youtube'(req) {
    const jobId = jobIdFromBody(req)
    if (!jobId) return { status: 400, body: { erro: 'jobId é obrigatório' } }
    const { title, description, tags } = req.body || {}
    const { job, videoId } = await postToYoutube({ jobId, title, description, tags })
    return { status: 200, body: { job, videoId } }
  },

  async 'post-instagram'(req) {
    const jobId = jobIdFromBody(req)
    if (!jobId) return { status: 400, body: { erro: 'jobId é obrigatório' } }
    const caption = typeof req.body?.caption === 'string' ? req.body.caption : undefined
    const resultado = await postToInstagram({ jobId, caption })
    // status:"processando" não é erro — o container do Reels ainda está
    // sendo processado pelo Instagram; 202 sinaliza "aceito, ainda não
    // concluído" pro cliente decidir se tenta de novo.
    return { status: resultado.status === 'processando' ? 202 : 200, body: resultado }
  },
}

export default async function handler(req, res) {
  if (!checkAuth(req)) return unauthorized(res)
  res.setHeader('Cache-Control', 'no-store')

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ erro: 'use POST' })
  }

  const action = req.query?.action
  const run = typeof action === 'string' ? ACTIONS[action] : undefined
  if (!run) return res.status(404).json({ erro: 'ação desconhecida' })

  try {
    const { status, body } = await run(req)
    return res.status(status).json(body)
  } catch (e) {
    return res.status(e.status || 500).json({ erro: e.message })
  }
}
