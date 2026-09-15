// Story Engine (Missão 006, Fase 10) — cliente das rotas api/story/[action].mjs.
//
// Desvio deliberado da spec original: o brief pedia
// `generateDailyNarrative(metrics: KairosMetrics): string` chamando um
// `/api/generate-script.ts` que não existe neste repo (rotas são .mjs sob
// api/, lógica de negócio em api/_*.js — convenção usada em todas as Fases
// anteriores). Também não aceita `metrics` do chamador: o servidor recalcula
// os números reais (mesma fonte do Painel Operacional) para não abrir brecha
// de o cliente "narrar" em cima de valor inventado — red line do Founder
// ("não inventar dados de métricas — só reais do Supabase"). Por isso as
// duas funções são assíncronas e batem na rede, e devolvem o estado inteiro
// (não só a string), pra quem chama tratar "indisponível" sem fingir sucesso.
import type { AgentActivityResponse, StoryNarrativeResponse } from '../types/operations'

async function authedFetch<T>(path: string, header: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { accept: 'application/json', authorization: header, ...(init.headers || {}) },
    cache: 'no-store',
  })
  const body = await response.json().catch(() => ({}))
  if (!response.ok && !('source' in body)) {
    throw new Error(body.erro || `${path} respondeu ${response.status}.`)
  }
  return body as T
}

export async function generateDailyNarrative(header: string): Promise<StoryNarrativeResponse> {
  return authedFetch<StoryNarrativeResponse>('/api/story/narrative', header, { method: 'POST' })
}

export async function getAgentActivity(header: string): Promise<AgentActivityResponse> {
  return authedFetch<AgentActivityResponse>('/api/story/activity', header, { method: 'GET' })
}
