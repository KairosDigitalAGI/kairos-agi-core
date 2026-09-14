// GET /api/agent-status — frota real de processos monitorados (command.agents,
// alimentado pelo sidecar do kairos-command a partir de cada VPS) + últimos
// eventos críticos (command.events).
//
// SOMENTE LEITURA. Esta rota nunca reinicia, para ou mata processo nenhum —
// isso é papel exclusivo do sidecar, rodando ao lado do próprio agente na VPS.
// Nenhum agente deste Core toca em pm2 sem ordem explícita do Founder.
import { checkAuth, unauthorized } from './_auth.js'
import { computeFleetStatus } from './_business.js'

export default async function handler(req, res) {
  if (!checkAuth(req)) return unauthorized(res)
  res.setHeader('Cache-Control', 'no-store')

  try {
    return res.status(200).json(await computeFleetStatus())
  } catch (e) {
    return res.status(500).json({ erro: e.message })
  }
}
