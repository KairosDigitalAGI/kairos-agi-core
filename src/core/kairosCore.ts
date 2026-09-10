import { agents, crmClients, founderEconomy, metrics, missions } from '../data/mock'

export const kairosCore = {
  edition: 'Founder Edition',
  company: 'Kairos Digital',
  version: '0.1.0',
  dataMode: 'Mock',
  agents,
  clients: crmClients,
  economy: founderEconomy,
  metrics,
  missions,
} as const

export const coreSummary = {
  activeAgents: agents.filter((agent) => agent.status === 'Trabalhando').length,
  pendingMissions: missions.filter((mission) => mission.status !== 'Concluída').length,
  activeClients: crmClients.filter((client) => client.pipeline === 'Ativo').length,
}
