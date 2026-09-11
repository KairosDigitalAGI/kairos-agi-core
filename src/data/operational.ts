import type { CrmClient, FounderAgent, Metric, Mission } from '../types'

// Unknown external values are unavailable, never inferred as zero.
export const metrics: Metric[] = [
  ['total-revenue', 'Receita total'], ['monthly-revenue', 'Receita mensal'],
  ['active-leads', 'Leads ativos'], ['active-clients', 'Clientes ativos'],
  ['working-agents', 'Agentes trabalhando'], ['service-orders', 'Ordens de serviço'],
  ['pending-missions', 'Missões pendentes'],
].map(([id, label]) => ({ id, label, value: '—', delta: 'Fonte não conectada', tone: 'idle' }))
export const agents: FounderAgent[] = [
  { id: 'orion', name: 'ORION', role: 'CEO Operacional', color: '#9b6cff', position: [-3.2, 0, -0.8] },
  { id: 'kairos', name: 'KAIROS', role: 'Robô do Founder', color: '#38bdf8', position: [-1.05, 0, 1.05] },
  { id: 'instagram-ai', name: 'Instagram AI', role: 'Social Engine', color: '#f472b6', position: [1.25, 0, 0.35] },
  { id: 'hunter-ai', name: 'Hunter AI', role: 'Demand Network', color: '#34d399', position: [3.35, 0, -0.85] },
].map(agent => ({ ...agent, status: 'Aguardando', task: 'Executor não conectado.', progress: 0 })) as FounderAgent[]
export const missions: Mission[] = []
export const crmClients: CrmClient[] = []
export const instagramProfile = { handle: '_kairosdigital_', url: 'https://www.instagram.com/_kairosdigital_/', source: 'Informado pelo Founder' } as const
