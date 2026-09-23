import type { AgentEvent } from '../core/contracts.js'

export interface TenantContext {
  tenantId: string
  allowedChannels: AgentEvent['channel'][]
  approvalRequired: boolean
}

export function assertTenant(event: AgentEvent, tenant: TenantContext): void {
  if (event.tenantId !== tenant.tenantId) throw new Error('Tenant mismatch')
  if (!tenant.allowedChannels.includes(event.channel)) throw new Error('Channel not allowed')
}