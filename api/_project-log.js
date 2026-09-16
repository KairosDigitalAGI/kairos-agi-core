// Mapa do Projeto (Missão 006, Fase 14) — diário de bordo append-only do
// próprio desenvolvimento do kairos-agi-core, em command.project_log
// (migration 0023_project_log.sql, repo kairos-command). Qualquer agente
// (Claude Code, Codex) grava uma entrada ao fim de cada sessão — ver
// AGENTS.md na raiz deste repo. Nunca edita nem apaga: só INSERT.
import { readCommand, writeCommand, commandConfigured } from './_command.js'

const MIGRATION_HINT =
  'A migration supabase/migrations/0023_project_log.sql (repo kairos-command) ainda não foi aplicada em produção — colar no SQL Editor do Supabase para ativar o Mapa do Projeto.'

const AGENTS = ['claude-code', 'codex', 'founder']
const TYPES = ['done', 'todo', 'idea', 'bug']

/**
 * Lista todas as entradas do Mapa, mais recentes primeiro. Leitura pública
 * de propósito (a própria ideia do Mapa é ser visível sem desbloquear o
 * Painel Operacional) — nunca carrega segredo, só o diário de bordo.
 */
export async function listProjectLog() {
  if (!commandConfigured()) {
    return { source: 'unavailable', reason: 'SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY não configuradas nesta implantação.', entries: [] }
  }
  try {
    const rows = await readCommand('project_log', '?select=id,created_at,agent,phase,type,title,description,commit,deployed&order=created_at.desc&limit=500')
    return { source: 'real', checkedAt: new Date().toISOString(), entries: rows || [] }
  } catch (e) {
    return { source: 'unavailable', reason: `${MIGRATION_HINT} (${e.message})`, entries: [] }
  }
}

/**
 * Registra uma entrada nova (done/todo/idea/bug). Sempre um INSERT — não
 * existe update/delete aqui de propósito, é histórico, nunca reescrito.
 */
export async function addProjectLogEntry({ agent, phase, type, title, description, commit, deployed }) {
  if (!AGENTS.includes(agent)) {
    const err = new Error(`agent inválido: precisa ser um de ${AGENTS.join(', ')}`)
    err.status = 400
    throw err
  }
  if (!TYPES.includes(type)) {
    const err = new Error(`type inválido: precisa ser um de ${TYPES.join(', ')}`)
    err.status = 400
    throw err
  }
  if (typeof title !== 'string' || !title.trim()) {
    const err = new Error('title é obrigatório')
    err.status = 400
    throw err
  }
  if (!commandConfigured()) {
    const err = new Error('SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY não configuradas nesta implantação.')
    err.status = 503
    throw err
  }
  const payload = {
    agent,
    phase: typeof phase === 'string' && phase.trim() ? phase.trim() : null,
    type,
    title: title.trim(),
    description: typeof description === 'string' && description.trim() ? description.trim() : null,
    commit: typeof commit === 'string' && commit.trim() ? commit.trim() : null,
    deployed: Boolean(deployed),
  }
  try {
    const [row] = await writeCommand('project_log', payload)
    return row
  } catch (e) {
    const err = new Error(`${MIGRATION_HINT} (${e.message})`)
    err.status = 503
    throw err
  }
}
