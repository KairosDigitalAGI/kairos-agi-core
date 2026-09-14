// Cálculos e escrita reais sobre o pipeline de conteúdo (Missão 006, Fase 3)
// — command.content_jobs/content_assets/content_calendar/avatars/prompt_library,
// schema desenhado em kairos-command/supabase/migrations/0020_content_engine.sql
// mas AINDA NÃO aplicado em produção pelo Founder (o SQL fica pronto pra colar
// no SQL Editor do Supabase, mesmo padrão de outras migrations pendentes desta
// conta). Até lá, toda leitura/escrita aqui reporta "indisponível" com o
// motivo real — nunca inventa job, etapa ou número.
import { readCommand, writeCommand, commandConfigured } from './_command.js'

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
