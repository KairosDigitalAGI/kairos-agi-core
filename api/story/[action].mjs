// POST /api/story/narrative — narração diária gamificada, em cima de métricas
//                              reais (custa uma chamada de provider pago)
// GET  /api/story/activity  — feed "Operações ativas" do Dashboard (leitura)
//
// Mesmo padrão de consolidação de api/content-jobs/[action].mjs e
// api/avatars/[action].mjs: uma rota dinâmica por domínio para não estourar
// o teto de 12 Serverless Functions do plano Hobby da Vercel. Lógica real em
// api/_story.js.
import { checkAuth, unauthorized } from '../_auth.js'
import { generateDailyNarrative, getAgentActivity } from '../_story.js'

const ACTIONS = {
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
}

export default async function handler(req, res) {
  if (!checkAuth(req)) return unauthorized(res)
  res.setHeader('Cache-Control', 'no-store')

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
