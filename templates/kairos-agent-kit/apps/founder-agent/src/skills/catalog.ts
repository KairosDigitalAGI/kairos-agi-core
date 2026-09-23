import type { AgentSkill } from '../core/contracts.js'

export const skillCatalog: ReadonlyArray<{ id: string; description: string }> = [
  { id: 'whatsapp-gateway', description: 'Adapta eventos oficiais do canal para o contrato interno.' },
  { id: 'llm-router', description: 'Roteia uma solicitação ao provedor configurado por tenant.' },
  { id: 'lead-intelligence', description: 'Qualifica oportunidades que vieram de fonte autorizada.' },
  { id: 'content-ops', description: 'Prepara ativos e rascunhos que requerem aprovação.' },
  { id: 'memory-state', description: 'Mantém estado isolado com política de retenção.' }
]

export function enabledSkills(skills: AgentSkill[]): AgentSkill[] {
  return skills.filter((skill) => skill.enabled)
}