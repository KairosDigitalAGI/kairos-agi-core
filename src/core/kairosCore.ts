import { agents, crmClients, metrics, missions } from '../data/operational'

export const kairosCore = {
  edition: 'Founder Edition',
  company: 'Kairos Digital',
  version: '0.1.0',
  dataMode: 'Fontes reais; integrações pendentes',
  agents,
  clients: crmClients,
  metrics,
  missions,
} as const

export const coreSummary = {
  activeAgents: agents.filter((agent) => agent.status === 'Trabalhando').length,
  pendingMissions: missions.filter((mission) => mission.status !== 'Concluída').length,
  activeClients: crmClients.filter((client) => client.pipeline === 'Ativo').length,
}
