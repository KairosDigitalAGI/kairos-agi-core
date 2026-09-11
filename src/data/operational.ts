import agentRegistry from './agentRegistry.json'
import type { CrmClient, FounderAgent, Metric, Mission } from '../types'

// Unknown external values are unavailable, never inferred as zero.
export const metrics: Metric[] = [
  ['total-revenue', 'Receita total'], ['monthly-revenue', 'Receita mensal'],
  ['active-leads', 'Leads ativos'], ['active-clients', 'Clientes ativos'],
  ['working-agents', 'Agentes trabalhando'], ['service-orders', 'Ordens de serviço'],
  ['pending-missions', 'Missões pendentes'],
].map(([id, label]) => ({ id, label, value: '—', delta: 'Fonte não conectada', tone: 'idle' }))
export const agents: FounderAgent[] = agentRegistry.map((agent, index) => ({
  id: agent.id, name: agent.name, role: agent.role, color: agent.color,
  position: [((index % 5) - 2) * 2, 0, Math.floor(index / 5) * 1.5 - 4],
  status: 'Aguardando', task: 'Executor não conectado ao Core.', progress: 0,
}))
export const missions: Mission[] = []
export const crmClients: CrmClient[] = []
export const instagramProfile = { handle: '_kairosdigital_', url: 'https://www.instagram.com/_kairosdigital_/', source: 'Informado pelo Founder' } as const
