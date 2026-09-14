// Cálculos reais compartilhados sobre o schema `command` — usados por
// api/business-metrics.mjs, api/agent-status.mjs e api/_agent-chat.js (system
// prompt do chat). Um único lugar para não recalcular (e não divergir) receita,
// MRR, clientes e frota.
import { readCommand, commandConfigured } from './_command.js'

function inicioDoMesISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

export async function computeBusinessMetrics() {
  if (!commandConfigured()) {
    return { source: 'unavailable', reason: 'SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY não configuradas nesta implantação.' }
  }
  const desde = inicioDoMesISO()
  const [receitasMes, receitasTodas, clientes] = await Promise.all([
    readCommand('receitas', `?data=gte.${desde}&select=valor,tipo`),
    readCommand('receitas', '?select=valor'),
    readCommand('clientes', '?select=id,ativo'),
  ])

  const receitaMes = receitasMes.reduce((soma, r) => soma + Number(r.valor || 0), 0)
  const receitaTotal = receitasTodas.reduce((soma, r) => soma + Number(r.valor || 0), 0)
  const mrr = receitasMes
    .filter((r) => r.tipo === 'mensalidade')
    .reduce((soma, r) => soma + Number(r.valor || 0), 0)
  const clientesAtivos = clientes.filter((c) => c.ativo).length

  return {
    source: 'real',
    checkedAt: new Date().toISOString(),
    periodo: { desde, ate: 'hoje' },
    receitaMes,
    receitaTotal,
    mrr,
    mrrNota: 'Soma dos lançamentos tipo=mensalidade em command.receitas dentro do mês corrente.',
    clientesAtivos,
    clientesTotal: clientes.length,
  }
}

export async function computeFleetStatus() {
  if (!commandConfigured()) {
    return { source: 'unavailable', reason: 'SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY não configuradas nesta implantação.', fleet: [] }
  }
  const [agents, eventos] = await Promise.all([
    readCommand('agents', '?select=slug,nome,tipo,status,ultimo_heartbeat,vps_ip,pm2_name&order=nome.asc'),
    readCommand('events', '?nivel=eq.critico&select=agent_id,mensagem,ts&order=ts.desc&limit=10'),
  ])
  return { source: 'real', checkedAt: new Date().toISOString(), fleet: agents, alertasCriticos: eventos }
}
