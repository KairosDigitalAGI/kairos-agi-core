// GET /api/business-metrics — receita do mês, MRR e clientes ativos REAIS,
// lidos do schema `command` do Supabase mestre kairos (mesmo banco de
// produção do kairos-command: command.receitas e command.clientes).
//
// MRR aqui = soma dos lançamentos tipo='mensalidade' dentro do mês corrente
// (é o que o ledger de command.receitas registra; não é contrato ativo
// projetado — rótulo no retorno deixa isso explícito pro front não prometer
// mais do que o dado é).
//
// Sem SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY, devolve source:"unavailable" —
// nunca um número inventado (Real Data Policy do Core, docs/modules/REAL_DATA_POLICY.md).
import { checkAuth, unauthorized } from './_auth.js'
import { readCommand, commandConfigured } from './_command.js'

function inicioDoMesISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

export default async function handler(req, res) {
  if (!checkAuth(req)) return unauthorized(res)
  res.setHeader('Cache-Control', 'no-store')

  if (!commandConfigured()) {
    return res.status(200).json({
      source: 'unavailable',
      reason: 'SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY não configuradas nesta implantação.',
    })
  }

  try {
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

    return res.status(200).json({
      source: 'real',
      checkedAt: new Date().toISOString(),
      periodo: { desde, ate: 'hoje' },
      receitaMes,
      receitaTotal,
      mrr,
      mrrNota: 'Soma dos lançamentos tipo=mensalidade em command.receitas dentro do mês corrente.',
      clientesAtivos,
      clientesTotal: clientes.length,
    })
  } catch (e) {
    // Erro explícito em vez de mascarar com "unavailable": aqui o Supabase
    // respondeu algo inesperado, não é ausência de configuração.
    return res.status(500).json({ erro: e.message })
  }
}
