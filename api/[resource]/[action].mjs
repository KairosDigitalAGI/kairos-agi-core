// Rota dinâmica única para os domínios que já usavam uma rota dinâmica por
// recurso (avatars, story, content-jobs, studio). Consolidação de arquivo,
// não de comportamento: fundiu api/avatars/[action].mjs, api/story/[action].mjs
// e api/content-jobs/[action].mjs neste único arquivo pra liberar mais slots
// no teto de 12 Serverless Functions do plano Hobby da Vercel — e o recurso
// "studio" (Fase 16, Estúdio Kairos) nasceu direto aqui, sem nunca ter sido
// arquivo próprio. Cada URL pública dos três recursos originais mantém
// exatamente o mesmo path, método, Basic Auth e resposta que tinha como
// arquivo próprio — só que roteada por req.query.resource/req.query.action
// em vez de por nome de arquivo. Nenhuma lógica de negócio mudou; toda ela
// continua em api/_avatars.js, api/_story.js, api/_content.js e api/_studio.js.
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
import {
  listCharacters,
  createCharacter,
  generateCharacterPortrait,
  listReels,
  createReel,
  approveReel,
  listScenes,
  addScene,
} from '../_studio.js'
import { runStrategist, runScreenwriter, runDirector, runQA } from '../_studio_agents.js'

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

  studio: {
    async 'list-characters'(req) {
      if (req.method !== 'GET') return { status: 405, body: { erro: 'use GET' } }
      return { status: 200, body: await listCharacters() }
    },
    async 'create-character'(req) {
      if (req.method !== 'POST') return { status: 405, body: { erro: 'use POST' } }
      const { nome, descricao, promptVisual } = req.body || {}
      const character = await createCharacter({ nome, descricao, promptVisual, criadoPor: 'founder' })
      return { status: 200, body: { character } }
    },
    async 'generate-character-portrait'(req) {
      if (req.method !== 'POST') return { status: 405, body: { erro: 'use POST' } }
      const characterId = typeof req.body?.characterId === 'string' ? req.body.characterId.trim() : ''
      if (!characterId) return { status: 400, body: { erro: 'characterId é obrigatório' } }
      const character = await generateCharacterPortrait({ characterId })
      return { status: 200, body: { character } }
    },

    async 'list-reels'(req) {
      if (req.method !== 'GET') return { status: 405, body: { erro: 'use GET' } }
      return { status: 200, body: await listReels() }
    },
    async 'create-reel'(req) {
      if (req.method !== 'POST') return { status: 405, body: { erro: 'use POST' } }
      const { titulo, characterId, briefing, numScenesEstimado } = req.body || {}
      const reel = await createReel({ titulo, characterId, briefing, numScenesEstimado, criadoPor: 'founder' })
      return { status: 200, body: { reel } }
    },
    async 'approve-reel'(req) {
      if (req.method !== 'POST') return { status: 405, body: { erro: 'use POST' } }
      const reelId = typeof req.body?.reelId === 'string' ? req.body.reelId.trim() : ''
      if (!reelId) return { status: 400, body: { erro: 'reelId é obrigatório' } }
      const reel = await approveReel({ reelId, aprovadoPor: 'founder' })
      return { status: 200, body: { reel } }
    },

    async 'list-scenes'(req) {
      if (req.method !== 'GET') return { status: 405, body: { erro: 'use GET' } }
      const reelId = typeof req.query?.reelId === 'string' ? req.query.reelId.trim() : ''
      if (!reelId) return { status: 400, body: { erro: 'reelId é obrigatório' } }
      return { status: 200, body: await listScenes({ reelId }) }
    },
    async 'add-scene'(req) {
      if (req.method !== 'POST') return { status: 405, body: { erro: 'use POST' } }
      const { reelId, ordem, roteiro, promptVideo } = req.body || {}
      const scene = await addScene({ reelId, ordem, roteiro, promptVideo })
      return { status: 200, body: { scene } }
    },

    // Cadeia de agentes de texto — cada etapa é uma chamada separada (o
    // Founder revisa a saída de uma antes de disparar a próxima), mesmo
    // espírito de um clique por etapa do Content Engine.
    async 'generate-strategy'(req) {
      if (req.method !== 'POST') return { status: 405, body: { erro: 'use POST' } }
      const { titulo, briefing } = req.body || {}
      const resultado = await runStrategist({ titulo, briefing })
      return { status: 200, body: resultado }
    },
    async 'generate-reel-script'(req) {
      if (req.method !== 'POST') return { status: 405, body: { erro: 'use POST' } }
      const { titulo, estrategia, numScenes } = req.body || {}
      const resultado = await runScreenwriter({ titulo, estrategia, numScenes })
      return { status: 200, body: resultado }
    },
    async 'generate-direction'(req) {
      if (req.method !== 'POST') return { status: 405, body: { erro: 'use POST' } }
      const { roteiro, promptVisualPersonagem } = req.body || {}
      const resultado = await runDirector({ roteiro, promptVisualPersonagem })
      return { status: 200, body: resultado }
    },
    async 'generate-qa'(req) {
      if (req.method !== 'POST') return { status: 405, body: { erro: 'use POST' } }
      const { roteiro, promptsVisuais } = req.body || {}
      const resultado = await runQA({ roteiro, promptsVisuais })
      return { status: 200, body: resultado }
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
