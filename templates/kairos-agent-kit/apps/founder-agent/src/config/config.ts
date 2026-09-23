export type AgentChannel = 'whatsapp' | 'web' | 'manual'

export interface AgentConfig {
  tenantId: string
  channel: AgentChannel
  llmProvider: string
  llmModel: string
}

export function readConfig(values: Record<string, string | undefined>): AgentConfig {
  const required = ['KAIROS_TENANT_ID', 'KAIROS_CHANNEL', 'KAIROS_LLM_PROVIDER', 'KAIROS_LLM_MODEL'] as const
  for (const key of required) if (!values[key]) throw new Error(`Missing configuration: ${key}`)
  const channel = values.KAIROS_CHANNEL as AgentChannel
  if (!['whatsapp', 'web', 'manual'].includes(channel)) throw new Error('Unsupported KAIROS_CHANNEL')
  return { tenantId: values.KAIROS_TENANT_ID!, channel, llmProvider: values.KAIROS_LLM_PROVIDER!, llmModel: values.KAIROS_LLM_MODEL! }
}