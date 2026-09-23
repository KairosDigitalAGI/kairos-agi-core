export const hunterSources = ['99Freelas', 'Freelancer.com.br', 'Workana', 'Outra fonte autorizada'] as const
export type HunterSource = (typeof hunterSources)[number]

export const hunterStages = ['triagem', 'qualificada', 'proposta pronta', 'aguardando resposta'] as const
export type HunterStage = (typeof hunterStages)[number]

export interface HunterOpportunity {
  id: string
  title: string
  source: HunterSource
  url: string
  summary: string
  budget: string
  stage: HunterStage
  capturedAt: string
}

export interface HunterDraft {
  source: HunterSource
  title: string
  url: string
  summary: string
  budget: string
}

export const emptyHunterDraft: HunterDraft = {
  source: '99Freelas',
  title: '',
  url: '',
  summary: '',
  budget: '',
}

export function nextHunterStage(stage: HunterStage): HunterStage | null {
  const current = hunterStages.indexOf(stage)
  return hunterStages[current + 1] ?? null
}

export function createHunterOpportunity(draft: HunterDraft, id: string, capturedAt: string): HunterOpportunity {
  const title = draft.title.trim()
  const summary = draft.summary.trim()
  if (!title || !summary) throw new Error('Título e escopo são obrigatórios.')

  return {
    id,
    title,
    source: draft.source,
    url: draft.url.trim(),
    summary,
    budget: draft.budget.trim() || 'Orçamento não informado',
    stage: 'triagem',
    capturedAt,
  }
}
