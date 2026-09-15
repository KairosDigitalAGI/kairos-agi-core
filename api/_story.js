// Story Engine (Missão 006, Fase 10) — narração gamificada tom Matrix/vigilância
// e feed de atividade real do Content Engine para a seção "Operações ativas"
// do Dashboard.
//
// Regra inviolável (red line do Founder): "não inventar dados de métricas —
// só reais do Supabase". Por isso generateDailyNarrative() NUNCA aceita
// métricas vindas do cliente — ele mesmo recalcula receita/MRR/clientes
// (mesma fonte de api/_business.js, já usada pelo chat de agentes) e conta
// jobs reais do Content Engine, e só então pede pro provider pago transformar
// esses números reais em texto narrado. Sem provider configurado ou sem
// schema `command`, devolve source:'unavailable' com o motivo — nunca narra
// em cima de número inventado.
import { readCommand, commandConfigured } from './_command.js'
import { computeBusinessMetrics } from './_business.js'
import { selectProvider } from './_providers/index.js'
import registry from '../src/data/agentRegistry.json' with { type: 'json' }

const MIGRATION_HINT =
  'A migration supabase/migrations/0020_content_engine.sql (repo kairos-command) precisa estar aplicada em produção para o Story Engine ler atividade real.'

// Mapeamento estável etapa→papel do organograma: descreve qual DEPARTAMENTO
// do Blueprint é dono de cada etapa do pipeline (fato organizacional, já
// documentado em docs/context/MASTER_CONTEXT.md e no próprio agentRegistry.json
// — 'social' cobre roteiro/legenda, 'video-ai' cobre imagem/vídeo, 'youtube'
// cobre publicação). NÃO é uma afirmação de que aquele agente específico
// executou aquele job — nenhum agente tem executor conectado neste Core
// (mesma honestidade do chat, Fase 2) — é só rótulo de "área responsável",
// pra não aparecer feed genérico sem contexto nenhum.
const ETAPA_PARA_AGENTE_SLUG = {
  ideia: 'cmo',
  roteiro: 'social',
  imagem: 'clone-ai',
  video: 'video-ai',
  legenda: 'social',
  aprovacao: 'cro',
  publicado: 'youtube',
  rejeitado: 'qa-ai',
}

function agentLabel(slug) {
  const agent = registry.find((a) => a.id === slug)
  return agent ? { slug: agent.id, name: agent.name, department: agent.department } : { slug, name: slug, department: '' }
}

async function contentCounters() {
  if (!commandConfigured()) return null
  const jobs = await readCommand('content_jobs', '?select=etapa')
  const porEtapa = jobs.reduce((acc, j) => { acc[j.etapa] = (acc[j.etapa] || 0) + 1; return acc }, {})
  return {
    videosGerados: (porEtapa.video || 0) + (porEtapa.publicado || 0),
    postsPublicados: porEtapa.publicado || 0,
    jobsAtivos: jobs.length,
  }
}

/**
 * Narração diária em primeira pessoa, tom Matrix/vigilância, em cima de
 * números 100% reais (receita/MRR/clientes de command.receitas/clientes,
 * contagem de jobs de command.content_jobs). Um clique do Founder por
 * chamada — mesma fronteira de autorização de todo provider pago neste Core.
 */
export async function generateDailyNarrative({ providerName } = {}, opts = {}) {
  const [business, content] = await Promise.all([
    computeBusinessMetrics().catch(() => ({ source: 'unavailable' })),
    contentCounters().catch(() => null),
  ])
  if (business.source !== 'real' && !content) {
    return { source: 'unavailable', reason: 'Nenhuma métrica real disponível (schema command não configurado nesta implantação).' }
  }

  let provider
  try {
    provider = opts.provider || selectProvider(providerName)
  } catch (e) {
    const err = new Error(e.message)
    err.status = 503
    throw err
  }

  const linhasDados = []
  if (business.source === 'real') {
    linhasDados.push(`Receita do mês: R$ ${Math.round(business.receitaMes).toLocaleString('pt-BR')} · MRR: R$ ${Math.round(business.mrr).toLocaleString('pt-BR')} · Clientes ativos: ${business.clientesAtivos}/${business.clientesTotal}`)
  } else {
    linhasDados.push('Receita/MRR/clientes: indisponíveis nesta implantação.')
  }
  if (content) {
    linhasDados.push(`Content Engine: ${content.jobsAtivos} jobs no pipeline, ${content.videosGerados} vídeos gerados, ${content.postsPublicados} publicados.`)
  } else {
    linhasDados.push('Content Engine: indisponível nesta implantação.')
  }

  const system = [
    'Você narra, em primeira pessoa, o dia operacional da Kairos Digital — tom Matrix/vigilância digital, um agente de IA reportando o que observou.',
    'Responda só com a narração (3 a 5 frases), português do Brasil, sem markdown.',
    'Use SOMENTE os números reais fornecidos abaixo. Nunca invente cliente, valor ou evento que não esteja na lista.',
  ].join('\n')
  const userContent = ['# Dados reais de hoje', ...linhasDados].join('\n')

  let resultado
  try {
    resultado = await provider.chat({ system, messages: [{ role: 'user', content: userContent }], maxTokens: 300 })
  } catch (e) {
    const err = new Error(`provider ${provider.name}: ${e.message}`)
    err.status = e.status && e.status >= 400 && e.status < 600 ? e.status : 502
    throw err
  }
  return { source: 'real', checkedAt: new Date().toISOString(), narrative: resultado.text, provider: provider.name }
}

/**
 * Feed "Operações ativas" — últimos content_jobs reais, cada um rotulado com
 * o agente/departamento responsável pela etapa atual (rótulo organizacional,
 * nunca uma alegação de execução real — ver comentário de ETAPA_PARA_AGENTE_SLUG).
 */
export async function getAgentActivity({ limit = 10 } = {}) {
  if (!commandConfigured()) {
    return { source: 'unavailable', reason: 'SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY não configuradas nesta implantação.', activity: [] }
  }
  let jobs
  try {
    jobs = await readCommand('content_jobs', `?select=id,titulo,etapa,atualizado_em&order=atualizado_em.desc&limit=${Number(limit) || 10}`)
  } catch (e) {
    const err = new Error(`${MIGRATION_HINT} (${e.message})`)
    err.status = 503
    throw err
  }
  const activity = jobs.map((job) => ({
    jobId: job.id,
    titulo: job.titulo,
    etapa: job.etapa,
    atualizadoEm: job.atualizado_em,
    agente: agentLabel(ETAPA_PARA_AGENTE_SLUG[job.etapa] || 'cmo'),
  }))
  return { source: 'real', checkedAt: new Date().toISOString(), activity }
}
