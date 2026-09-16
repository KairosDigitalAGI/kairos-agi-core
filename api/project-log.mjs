// GET  /api/project-log — lista o Mapa do Projeto (mais recentes primeiro).
//                          Sem Basic Auth de propósito: o Mapa é o diário de
//                          bordo do próprio desenvolvimento, feito pra ser
//                          visível sem desbloquear o Painel Operacional —
//                          nunca carrega segredo, só feito/pendente/ideia/bug.
// POST /api/project-log — registra uma entrada nova. Protegido por Basic
//                          Auth (mesma credencial do Painel Operacional):
//                          só quem já desbloqueou o painel escreve no Mapa.
import { checkAuth, unauthorized } from './_auth.js'
import { listProjectLog, addProjectLogEntry } from './_project-log.js'

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')

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
}
