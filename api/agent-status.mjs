// GET /api/agent-status — frota real de processos monitorados (command.agents,
// alimentado pelo sidecar do kairos-command a partir de cada VPS) + últimos
// eventos críticos (command.events).
//
// SOMENTE LEITURA. Esta rota nunca reinicia, para ou mata processo nenhum —
// isso é papel exclusivo do sidecar, rodando ao lado do próprio agente na VPS.
// Nenhum agente deste Core toca em pm2 sem ordem explícita do Founder.
import { checkAuth, unauthorized } from './_auth.js'
import { readCommand, commandConfigured } from './_command.js'

export default async function handler(req, res) {
  if (!checkAuth(req)) return unauthorized(res)
  res.setHeader('Cache-Control', 'no-store')

  if (!commandConfigured()) {
    return res.status(200).json({
      source: 'unavailable',
      reason: 'SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY não configuradas nesta implantação.',
      fleet: [],
    })
  }

  try {
    const [agents, eventos] = await Promise.all([
      readCommand(
        'agents',
        '?select=slug,nome,tipo,status,ultimo_heartbeat,vps_ip,pm2_name&order=nome.asc',
      ),
      readCommand(
        'events',
        '?nivel=eq.critico&select=agent_id,mensagem,ts&order=ts.desc&limit=10',
      ),
    ])

    return res.status(200).json({
      source: 'real',
      checkedAt: new Date().toISOString(),
      fleet: agents,
      alertasCriticos: eventos,
    })
  } catch (e) {
    return res.status(500).json({ erro: e.message })
  }
}
