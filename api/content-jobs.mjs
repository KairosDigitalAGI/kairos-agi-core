// GET /api/content-jobs — pipeline real do Content Engine (command.content_jobs).
// POST /api/content-jobs — o Founder registra uma ideia nova (a linha nasce em
// etapa=ideia, padrão da coluna). Mesma Basic Auth do Painel Operacional; sem
// migration 0020 aplicada em produção, GET reporta "unavailable" com o motivo
// e POST falha fechado com 503 — nunca finge ter criado o job.
import { checkAuth, unauthorized } from './_auth.js'
import { computeContentPipeline, createContentJob } from './_content.js'

export default async function handler(req, res) {
  if (!checkAuth(req)) return unauthorized(res)
  res.setHeader('Cache-Control', 'no-store')

  if (req.method === 'GET') {
    try {
      return res.status(200).json(await computeContentPipeline())
    } catch (e) {
      return res.status(500).json({ erro: e.message })
    }
  }

  if (req.method === 'POST') {
    const titulo = typeof req.body?.titulo === 'string' ? req.body.titulo.trim() : ''
    if (!titulo) return res.status(400).json({ erro: 'titulo é obrigatório' })
    try {
      const job = await createContentJob({ titulo, briefing: req.body?.briefing, criadoPor: 'founder' })
      return res.status(201).json({ job })
    } catch (e) {
      return res.status(e.status || 500).json({ erro: e.message })
    }
  }

  res.setHeader('Allow', 'GET, POST')
  return res.status(405).json({ erro: 'use GET ou POST' })
}
