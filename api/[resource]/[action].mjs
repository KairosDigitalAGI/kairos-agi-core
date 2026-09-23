// Rota dinâmica única para os domínios que já usavam uma rota dinâmica por
// recurso (avatars, story, content-jobs). Consolidação de arquivo, não de
// comportamento: fundiu api/avatars/[action].mjs, api/story/[action].mjs e
// api/content-jobs/[action].mjs neste único arquivo pra liberar mais slots
// no teto de 12 Serverless Functions do plano Hobby da Vercel antes do
// Estúdio Kairos (Fase 14) precisar de rotas novas (characters, reels,
// scenes, studio-spend). Cada URL pública mantém exatamente o mesmo path,
// método, Basic Auth e resposta que tinha como arquivo próprio — só que
// roteada por req.query.resource/req.query.action em vez de por nome de
// arquivo. Nenhuma lógica de negócio mudou; toda ela continua em
// api/_avatars.js, api/_story.js e api/_content.js.
import { checkAuth, unauthorized } from '../_auth.js'
import { listAvatars, ensureAvatar } from '../_avatars.js'
import { generateDailyNarrative, getAgentActivity } from '../_story.js'
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

const RESOURCES = {
  avatars: {
    async list(req) {
      if (req.method !== 'GET') return { status: 405, body: { erro: 'use GET' } }
      const result = await listAvatars()
      return { status: 200, body: result }
    },
    async upsert(req) {
      if (req.method !== 'POST') return { status: 405, body: { erro: 'use POST' } }
      const agenteSlug = typeof req.body?.agenteSlug === 'string' ? req.body.agenteSlug.trim() : ''
      const avatar = await ensureAvatar({ agenteSlug })
      return { status: 200, body: { avatar } }
    },
  },

  story: {
    async narrative(req) {
      if (req.method !== 'POST') return { status: 405, body: { erro: 'use POST' } }
      const result = await generateDailyNarrative({})
      return { status: result.source === 'unavailable' ? 503 : 200, body: result }
    },
    async activity(req) {
      if (req.method !== 'GET') return { status: 405, body: { erro: 'use GET' } }
      const result = await getAgentActivity({})
      return { status: 200, body: result }
    },
  },

  'content-jobs': {
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
      const tier = req.body?.tier === 'paid' ? 'paid' : 'free'
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
  },
}

export default async function handler(req, res) {
  if (!checkAuth(req)) return unauthorized(res)
  res.setHeader('Cache-Control', 'no-store')

  const resource = req.query?.resource
  const action = req.query?.action
  const actions = typeof resource === 'string' ? RESOURCES[resource] : undefined
  const run = actions && typeof action === 'string' ? actions[action] : undefined
  if (!run) return res.status(404).json({ erro: 'ação desconhecida' })

  try {
    const { status, body } = await run(req)
    return res.status(status).json(body)
  } catch (e) {
    return res.status(e.status || 500).json({ erro: e.message })
  }
}
