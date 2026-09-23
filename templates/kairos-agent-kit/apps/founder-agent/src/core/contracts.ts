export interface AgentEvent {
  id: string
  tenantId: string
  channel: 'whatsapp' | 'web' | 'manual'
  kind: 'inbound_message' | 'manual_task'
  receivedAt: string
  content: string
}

export interface AgentResponse {
  eventId: string
  text: string
  requiresApproval: boolean
}

export interface AgentSkill {
  id: string
  enabled: boolean
  execute(event: AgentEvent): Promise<AgentResponse | null>
}