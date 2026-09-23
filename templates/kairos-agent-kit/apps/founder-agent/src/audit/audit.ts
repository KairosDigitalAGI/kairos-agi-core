export interface AuditEvent {
  id: string
  tenantId: string
  type: 'received' | 'drafted' | 'approved' | 'sent' | 'failed'
  occurredAt: string
  referenceId: string
}

export interface AuditWriter { append(event: AuditEvent): Promise<void> }