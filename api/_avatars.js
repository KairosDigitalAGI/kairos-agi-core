// Avatar Studio (Missão 006, Fase 9) — progresso real de gamificação por
// agente do organograma. `command.avatars` (migration 0020_content_engine.sql,
// já aplicada em produção) só guarda nivel/xp/coins/conquistas por
// `agente_slug` — identidade (nome/role/departamento) NUNCA fica no banco,
// vive em src/data/agentRegistry.json deste mesmo repo (comentário da própria
// tabela: "agente_slug = id em data/agentRegistry.json no kairos-agi-core;
// texto puro, não FK — o registro vive no repo, não no banco"). Este módulo
// só faz o join dos dois lados; nunca inventa nem grava identidade no Supabase.
import { readCommand, upsertCommand, commandConfigured } from './_command.js'
import registry from '../src/data/agentRegistry.json' with { type: 'json' }

const MIGRATION_HINT =
  'A migration supabase/migrations/0020_content_engine.sql (repo kairos-command) precisa estar aplicada em produção para o Avatar Studio ler/gravar progresso.'

/**
 * Lista os 27 agentes do organograma (identidade real do registro) já
 * mesclados com o progresso real do Supabase, quando existir. Um agente sem
 * linha em command.avatars ainda aparece no grid — com hasProgress:false e
 * nivel/xp/coins zerados, nunca com número fabricado.
 */
export async function listAvatars() {
  if (!commandConfigured()) {
    return {
      source: 'unavailable',
      reason: 'SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY não configuradas nesta implantação.',
      avatars: registry.map((agent) => baseline(agent)),
    }
  }
  let rows
  try {
    rows = await readCommand('avatars', '?select=agente_slug,nivel,xp,coins,conquistas,atualizado_em')
  } catch (e) {
    const err = new Error(`${MIGRATION_HINT} (${e.message})`)
    err.status = 503
    throw err
  }
  const bySlug = new Map((rows || []).map((row) => [row.agente_slug, row]))
  const avatars = registry.map((agent) => {
    const progress = bySlug.get(agent.id)
    return progress
      ? { ...baseline(agent), hasProgress: true, nivel: progress.nivel, xp: progress.xp, coins: Number(progress.coins), conquistas: progress.conquistas, atualizadoEm: progress.atualizado_em }
      : baseline(agent)
  })
  return { source: 'real', checkedAt: new Date().toISOString(), avatars }
}

function baseline(agent) {
  return {
    slug: agent.id,
    name: agent.name,
    role: agent.role,
    department: agent.department,
    hasProgress: false,
    nivel: 1,
    xp: 0,
    coins: 0,
    conquistas: [],
    atualizadoEm: null,
  }
}

/**
 * Garante a linha de progresso de UM agente já existente no registro — nunca
 * cria identidade nova (o registro é a única fonte de identidade). Idempotente:
 * se já existe linha, on_conflict=agente_slug faz merge sem apagar progresso
 * acumulado (só envia agente_slug no payload, então nivel/xp/coins mantêm o
 * valor gravado quando a linha já existe, e caem nos defaults da própria
 * tabela — 1/0/0 — na primeira criação).
 */
export async function ensureAvatar({ agenteSlug }) {
  if (typeof agenteSlug !== 'string' || !agenteSlug.trim()) {
    const err = new Error('agenteSlug é obrigatório')
    err.status = 400
    throw err
  }
  const agent = registry.find((a) => a.id === agenteSlug)
  if (!agent) {
    const err = new Error(`agente desconhecido: "${agenteSlug}" não existe em src/data/agentRegistry.json`)
    err.status = 404
    throw err
  }
  if (!commandConfigured()) {
    const err = new Error('SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY não configuradas nesta implantação.')
    err.status = 503
    throw err
  }
  try {
    const [row] = await upsertCommand('avatars', { agente_slug: agenteSlug }, 'agente_slug')
    return { ...baseline(agent), hasProgress: true, nivel: row.nivel, xp: row.xp, coins: Number(row.coins), conquistas: row.conquistas, atualizadoEm: row.atualizado_em }
  } catch (e) {
    const err = new Error(`${MIGRATION_HINT} (${e.message})`)
    err.status = 503
    throw err
  }
}
