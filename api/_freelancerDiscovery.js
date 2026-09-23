// Conector oficial do Freelancer.com. A URL da operação é configurada no
// servidor porque o Core não deve adivinhar endpoints, credenciais ou escopos
// de uma conta. Ele só consulta projetos; nunca envia lances ou mensagens.

const maxLimit = 50

export function freelancerDiscoveryConfigured(env = process.env) {
  return Boolean(env.FREELANCER_API_ACCESS_TOKEN && env.FREELANCER_API_PROJECTS_URL)
}

function text(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function pickBudget(project) {
  const fixed = text(project.budget) || text(project.currency?.code && project.budget?.amount)
  if (fixed) return fixed
  const minimum = project.budget?.minimum ?? project.budget?.min
  const maximum = project.budget?.maximum ?? project.budget?.max
  if (typeof minimum === 'number' || typeof maximum === 'number') {
    return [minimum, maximum].filter((value) => typeof value === 'number').join('–')
  }
  return 'Orçamento não informado pela fonte'
}

export function normalizeFreelancerProject(project) {
  const id = String(project.id ?? project.project_id ?? '')
  const title = text(project.title ?? project.name)
  const url = text(project.url ?? project.seo_url)
  const summary = text(project.description ?? project.preview_description ?? project.summary)
  if (!id || !title || !summary) return null
  return { sourceId: id, title, url, summary, budget: pickBudget(project) }
}

export async function discoverFreelancerProjects({ query, limit = 20, env = process.env, fetchImpl = fetch }) {
  if (!freelancerDiscoveryConfigured(env)) {
    const missing = ['FREELANCER_API_ACCESS_TOKEN', 'FREELANCER_API_PROJECTS_URL'].filter((key) => !env[key])
    const error = new Error(`Descoberta Freelancer indisponível: configure ${missing.join(' e ')} no servidor.`)
    error.status = 503
    throw error
  }
  const term = text(query)
  if (!term) {
    const error = new Error('Informe uma busca para a descoberta oficial.')
    error.status = 400
    throw error
  }

  const url = new URL(env.FREELANCER_API_PROJECTS_URL)
  url.searchParams.set('query', term)
  url.searchParams.set('limit', String(Math.min(Math.max(Number(limit) || 20, 1), maxLimit)))
  const response = await fetchImpl(url, {
    headers: { Authorization: `Bearer ${env.FREELANCER_API_ACCESS_TOKEN}`, Accept: 'application/json' },
  })
  if (!response.ok) {
    const body = await response.text().catch(() => '')
    const error = new Error(`Freelancer API respondeu ${response.status}: ${body.slice(0, 240)}`)
    error.status = 502
    throw error
  }

  const payload = await response.json()
  const records = Array.isArray(payload?.projects) ? payload.projects : Array.isArray(payload?.result?.projects) ? payload.result.projects : []
  return {
    source: 'Freelancer.com.br',
    query: term,
    observedAt: new Date().toISOString(),
    projects: records.map(normalizeFreelancerProject).filter(Boolean),
  }
}
