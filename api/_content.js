// Cálculos e escrita reais sobre o pipeline de conteúdo (Missão 006, Fase 3)
// — command.content_jobs/content_assets/content_calendar/avatars/prompt_library,
// schema desenhado em kairos-command/supabase/migrations/0020_content_engine.sql
// mas AINDA NÃO aplicado em produção pelo Founder (o SQL fica pronto pra colar
// no SQL Editor do Supabase, mesmo padrão de outras migrations pendentes desta
// conta). Até lá, toda leitura/escrita aqui reporta "indisponível" com o
// motivo real — nunca inventa job, etapa ou número.
import { readCommand, writeCommand, patchCommand, commandConfigured } from './_command.js'
import { selectProvider } from './_providers/index.js'

const MIGRATION_HINT =
  'A migration supabase/migrations/0020_content_engine.sql (repo kairos-command) ainda não foi aplicada em produção — colar no SQL Editor do Supabase para ativar o Content Engine.'

export async function computeContentPipeline() {
  if (!commandConfigured()) {
    return { source: 'unavailable', reason: 'SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY não configuradas nesta implantação.', jobs: [], porEtapa: {} }
  }
  try {
    const jobs = await readCommand('content_jobs', '?select=id,titulo,etapa,aprovado,criado_em&order=criado_em.desc&limit=50')
    const porEtapa = jobs.reduce((acc, job) => {
      acc[job.etapa] = (acc[job.etapa] || 0) + 1
      return acc
    }, {})
    return { source: 'real', checkedAt: new Date().toISOString(), jobs, porEtapa }
  } catch (e) {
    return { source: 'unavailable', reason: `${MIGRATION_HINT} (${e.message})`, jobs: [], porEtapa: {} }
  }
}

export async function createContentJob({ titulo, briefing, criadoPor }) {
  if (!commandConfigured()) {
    const err = new Error('SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY não configuradas nesta implantação.')
    err.status = 503
    throw err
  }
  try {
    const [job] = await writeCommand('content_jobs', {
      titulo,
      briefing: briefing && typeof briefing === 'object' ? briefing : {},
      criado_por: criadoPor || null,
    })
    return job
  } catch (e) {
    const err = new Error(`${MIGRATION_HINT} (${e.message})`)
    err.status = 503
    throw err
  }
}

/**
 * Gera o roteiro de um job em etapa "ideia" e avança para "roteiro".
 *
 * Só roda quando o Founder aciona explicitamente (botão "Gerar roteiro" no
 * painel) — nunca em lote, nunca automático. Mesma fronteira de autorização
 * já em produção desde a Fase 2 (chat de agentes): um clique do Founder por
 * chamada real ao provider pago, nunca geração disparada sozinha. Prioridade
 * de provider é a mesma de todo o Core (Anthropic/OpenAI pagos antes de
 * OpenRouter, decisão do Founder de 14/09/2026).
 */
export async function generateScript({ jobId, providerName }) {
  if (typeof jobId !== 'string' || !jobId.trim()) {
    const err = new Error('jobId é obrigatório')
    err.status = 400
    throw err
  }
  if (!commandConfigured()) {
    const err = new Error('SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY não configuradas nesta implantação.')
    err.status = 503
    throw err
  }

  let job
  try {
    const rows = await readCommand('content_jobs', `?select=id,titulo,etapa,briefing&id=eq.${encodeURIComponent(jobId)}&limit=1`)
    job = rows?.[0]
  } catch (e) {
    const err = new Error(`${MIGRATION_HINT} (${e.message})`)
    err.status = 503
    throw err
  }
  if (!job) {
    const err = new Error(`content_job ${jobId} não encontrado.`)
    err.status = 404
    throw err
  }
  if (job.etapa !== 'ideia') {
    const err = new Error(`content_job ${jobId} está em etapa "${job.etapa}", não "ideia" — o roteiro já foi gerado ou o job avançou.`)
    err.status = 409
    throw err
  }

  let provider
  try {
    provider = selectProvider(providerName)
  } catch (e) {
    const err = new Error(e.message)
    err.status = 503
    throw err
  }

  const briefing = job.briefing && typeof job.briefing === 'object' ? job.briefing : {}
  const system = [
    'Você escreve roteiros curtos (30 a 60 segundos falados) para Shorts/Reels da Kairos Digital.',
    'Responda só com o roteiro em português do Brasil, sem comentário nem formatação markdown — cena por cena quando fizer sentido.',
    'O roteiro é sobre a ideia dada. Nunca invente dado de cliente, receita ou métrica real da empresa dentro do roteiro.',
  ].join('\n')
  const partesBriefing = Object.entries(briefing).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join('\n')
  const userContent = [`Título da ideia: ${job.titulo}`, partesBriefing && `Briefing:\n${partesBriefing}`].filter(Boolean).join('\n\n')

  let resultado
  try {
    resultado = await provider.chat({ system, messages: [{ role: 'user', content: userContent }], maxTokens: 700 })
  } catch (e) {
    const err = new Error(`provider ${provider.name}: ${e.message}`)
    err.status = e.status && e.status >= 400 && e.status < 600 ? e.status : 502
    throw err
  }

  try {
    const [asset] = await writeCommand('content_assets', {
      job_id: job.id,
      tipo: 'roteiro',
      conteudo: resultado.text,
      provedor: provider.name,
      gratuito: false,
      metadata: { model: resultado.model, usage: resultado.usage },
    })
    const [updatedJob] = await patchCommand('content_jobs', `?id=eq.${encodeURIComponent(job.id)}`, { etapa: 'roteiro' })
    return { job: updatedJob || { ...job, etapa: 'roteiro' }, asset }
  } catch (e) {
    const err = new Error(`${MIGRATION_HINT} (${e.message})`)
    err.status = 503
    throw err
  }
}
