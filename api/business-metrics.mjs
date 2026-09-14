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
import { computeBusinessMetrics } from './_business.js'

export default async function handler(req, res) {
  if (!checkAuth(req)) return unauthorized(res)
  res.setHeader('Cache-Control', 'no-store')

  try {
    return res.status(200).json(await computeBusinessMetrics())
  } catch (e) {
    // Erro explícito em vez de mascarar com "unavailable": aqui o Supabase
    // respondeu algo inesperado, não é ausência de configuração.
    return res.status(500).json({ erro: e.message })
  }
}
