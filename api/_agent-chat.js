// Chat com agente — handler compartilhado, usado por api/agent-chat.mjs (rota Vercel).
// Contrato: handleAgentChat({ body }) → { status, body }
//
// Segurança: só roda atrás do mesmo Basic Auth de business-metrics/agent-status
// (api/_auth.js) — quem chama já está autenticado quando chega aqui. LLM só via
// api/_providers (nunca chave direto no handler, nunca no cliente).
//
// Honestidade: nenhum agente deste Core tem executor conectado ainda (ver
// docs/modules/REAL_DATA_POLICY.md e AgentsPage). O system prompt deixa isso
// explícito — o chat é consultivo, nunca finge ter executado uma ação real.
import registry from '../src/data/agentRegistry.json' with { type: 'json' }
import { selectProvider } from './_providers/index.js'
import { computeBusinessMetrics, computeFleetStatus } from './_business.js'

export const DEFAULTS = {
  historyLimit: Number(process.env.KAIROS_CHAT_HISTORY_LIMIT) || 12,
  maxTokens: Number(process.env.KAIROS_CHAT_MAX_TOKENS) || 800,
}

const brl = (n) => (n == null ? '—' : 'R$ ' + Math.round(n).toLocaleString('pt-BR'))

async function metricsSummary() {
  const [business, fleet] = await Promise.all([computeBusinessMetrics(), computeFleetStatus()])
  if (business.source !== 'real') {
    return `Dados financeiros indisponíveis: ${business.reason || 'schema command não configurado'}. Não invente número — diga que está indisponível.`
  }
  const linhas = [
    `Receita do mês: ${brl(business.receitaMes)} · Receita total: ${brl(business.receitaTotal)} · MRR: ${brl(business.mrr)}`,
    `Clientes ativos: ${business.clientesAtivos} de ${business.clientesTotal} cadastrados`,
    `Fonte: Supabase command.receitas/command.clientes, consultado agora (${business.checkedAt}).`,
  ]
  if (fleet.source === 'real') {
    const resumo = fleet.fleet.map((a) => `${a.nome}: ${a.status}`).join(', ') || 'nenhum agente cadastrado'
    linhas.push(`Frota WhatsApp (pm2): ${resumo}.`)
    if (fleet.alertasCriticos?.length) linhas.push(`Alertas críticos recentes: ${fleet.alertasCriticos.length}.`)
  }
  return linhas.join('\n')
}

function buildSystemPrompt(agent, metrics) {
  return [
    `Você é o agente "${agent.name}" (${agent.role}) do departamento ${agent.department} da Kairos Digital.`,
    `Responsabilidade: ${agent.responsibility}`,
    `Indicador que você acompanha: ${agent.kpi}`,
    'Você responde apenas ao Founder (Matheus), em português do Brasil, direto e técnico, sem bajulação.',
    'IMPORTANTE: você ainda NÃO tem executor conectado a este Core. Você não roda código, não dispara automações, não envia mensagem, não acessa sistema nenhum a partir desta conversa — só conversa e aconselha. Se pedirem uma ação, diga isso com clareza.',
    'Nunca afirme ter feito algo que esta conversa não fez. Nunca invente número: use só os dados reais abaixo.',
    '', '# Dados reais agora', metrics,
  ].join('\n')
}

export async function handleAgentChat({ body }, opts = {}) {
  let payload = body
  if (typeof payload === 'string') {
    try { payload = JSON.parse(payload || '{}') } catch { return { status: 400, body: { erro: 'body não é JSON' } } }
  }
  const { agentId, messages } = payload || {}
  if (!agentId || !Array.isArray(messages)) {
    return { status: 400, body: { erro: 'body esperado: { agentId, messages:[{role,content}] }' } }
  }

  const agent = registry.find((a) => a.id === agentId)
  if (!agent) return { status: 404, body: { erro: `agente desconhecido: ${agentId}`, agentes: registry.map((a) => a.id) } }

  const clean = messages
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .map((m) => ({ role: m.role, content: m.content.slice(0, 8000) }))
  if (!clean.length || clean[clean.length - 1].role !== 'user') {
    return { status: 400, body: { erro: 'a última mensagem precisa ser do usuário' } }
  }

  const historyLimit = opts.historyLimit || DEFAULTS.historyLimit
  const maxTokens = opts.maxTokens || DEFAULTS.maxTokens
  const window = clean.slice(-historyLimit)

  let metrics
  try { metrics = await metricsSummary() } catch (e) { return { status: 500, body: { erro: 'falha ao ler métricas reais: ' + e.message } } }
  const system = buildSystemPrompt(agent, metrics)

  let provider
  try { provider = opts.provider || selectProvider(opts.providerName) } catch (e) { return { status: 503, body: { erro: e.message } } }

  try {
    const r = await provider.chat({ system, messages: window, maxTokens })
    return {
      status: 200,
      body: {
        text: r.text, usage: r.usage, model: r.model, stopReason: r.stopReason, provider: provider.name,
        window: { sent: window.length, dropped: clean.length - window.length, limit: historyLimit },
      },
    }
  } catch (e) {
    console.error('[agent-chat]', agent.id, provider.name, e.message)
    const status = /não configurada/.test(e.message) ? 503 : (e.status && e.status >= 400 && e.status < 600 ? e.status : 502)
    return { status, body: { erro: `provider ${provider.name}: ${e.message}`, provider: provider.name } }
  }
}
