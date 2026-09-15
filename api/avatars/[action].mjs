// GET  /api/avatars/list          — grid do Avatar Studio (identidade do
//                                    registro + progresso real do Supabase)
// POST /api/avatars/upsert        — garante a linha de progresso de UM
//                                    agente já existente no registro
//
// Mesmo padrão de consolidação de api/content-jobs/[action].mjs: uma rota
// dinâmica por domínio para não estourar o teto de 12 Serverless Functions
// do plano Hobby da Vercel. Lógica real em api/_avatars.js.
import { checkAuth, unauthorized } from '../_auth.js'
import { listAvatars, ensureAvatar } from '../_avatars.js'

const ACTIONS = {
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
