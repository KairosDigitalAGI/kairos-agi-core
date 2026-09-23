import { hunterSources, hunterStages, type HunterOpportunity } from './domain'

const storageKey = 'kairos.hunter.opportunities.v1'

function isOpportunity(value: unknown): value is HunterOpportunity {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>
  return typeof candidate.id === 'string'
    && typeof candidate.title === 'string'
    && hunterSources.includes(candidate.source as (typeof hunterSources)[number])
    && typeof candidate.url === 'string'
    && typeof candidate.summary === 'string'
    && typeof candidate.budget === 'string'
    && hunterStages.includes(candidate.stage as (typeof hunterStages)[number])
    && typeof candidate.capturedAt === 'string'
}

export function loadHunterOpportunities(storage: Storage = window.localStorage): HunterOpportunity[] {
  try {
    const raw = storage.getItem(storageKey)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed.filter(isOpportunity) : []
  } catch {
    return []
  }
}

export function saveHunterOpportunities(opportunities: HunterOpportunity[], storage: Storage = window.localStorage): void {
  storage.setItem(storageKey, JSON.stringify(opportunities))
}
