// Rota dinâmica única para os endpoints de nível superior sem sub-recurso:
// agent-chat, agent-status, business-metrics, content-jobs e project-log.
// Consolidação de arquivo, não de comportamento — mesmo padrão já usado em
// api/content-jobs/[action].mjs e api/avatars/[action].mjs: cada URL
// pública mantém exatamente o mesmo path, método, Basic Auth e resposta,
// só que roteada por req.query.route em vez de por nome de arquivo. Libera
// slots no teto de 12 Serverless Functions do plano Hobby da Vercel para o
// Estúdio Kairos (Fase 14). Lógica de negócio segue nos módulos api/_*.js.
import { checkAuth, unauthorized } from './_auth.js'
import { handleAgentChat } from './_agent-chat.js'
import { computeFleetStatus, computeBusinessMetrics } from './_business.js'
import { computeContentPipeline, createContentJob } from './_content.js'
import { listProjectLog, addProjectLogEntry } from './_project-log.js'

const ROUTES = {
  async 'agent-chat'(req, res) {
    if (!checkAuth(req)) return unauthorized(res)
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST')
      return res.status(405).json({ erro: 'use POST' })
    }
    const out = await handleAgentChat({ body: req.body })
    return res.status(out.status).json(out.body)
  },

  async 'agent-status'(req, res) {
    if (!checkAuth(req)) return unauthorized(res)
    try {
      return res.status(200).json(await computeFleetStatus())
    } catch (e) {
      return res.status(500).json({ erro: e.message })
    }
  },

  async 'business-metrics'(req, res) {
    if (!checkAuth(req)) return unauthorized(res)
    try {
      return res.status(200).json(await computeBusinessMetrics())
    } catch (e) {
      // Erro explícito em vez de mascarar com "unavailable": aqui o Supabase
      // respondeu algo inesperado, não é ausência de configuração.
      return res.status(500).json({ erro: e.message })
    }
  },

  async 'content-jobs'(req, res) {
    if (!checkAuth(req)) return unauthorized(res)
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
  },

  async 'project-log'(req, res) {
    if (req.method === 'GET') {
      return res.status(200).json(await listProjectLog())
    }
    if (req.method === 'POST') {
      if (!checkAuth(req)) return unauthorized(res)
      try {
        const body = req.body || {}
        const entry = await addProjectLogEntry({
          agent: body.agent,
          phase: body.phase,
          type: body.type,
          title: body.title,
          description: body.description,
          commit: body.commit,
          deployed: body.deployed,
        })
        return res.status(201).json({ entry })
      } catch (e) {
        return res.status(e.status || 500).json({ erro: e.message })
      }
    }
    return res.status(405).json({ erro: 'use GET ou POST' })
  },
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  const route = req.query?.route
  const run = typeof route === 'string' ? ROUTES[route] : undefined
  if (!run) return res.status(404).json({ erro: 'rota desconhecida' })
  return run(req, res)
}
