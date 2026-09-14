// Contratos das rotas server-side que leem o schema `command` (Supabase
// mestre kairos) — dado operacional real, não organograma nem missão local.

export type DataSource = 'real' | 'unavailable'

export interface BusinessMetricsResponse {
  source: DataSource
  checkedAt?: string
  reason?: string
  periodo?: { desde: string; ate: string }
  receitaMes?: number
  receitaTotal?: number
  mrr?: number
  mrrNota?: string
  clientesAtivos?: number
  clientesTotal?: number
}

export interface FleetAgent {
  slug: string
  nome: string
  tipo: string | null
  status: 'online' | 'degradado' | 'offline' | 'desconhecido'
  ultimo_heartbeat: string | null
  vps_ip: string | null
  pm2_name: string | null
}

export interface FleetAlert {
  agent_id: string | null
  mensagem: string
  ts: string
}

export interface FleetStatusResponse {
  source: DataSource
  checkedAt?: string
  reason?: string
  fleet: FleetAgent[]
  alertasCriticos?: FleetAlert[]
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface AgentChatResponse {
  text: string
  provider: string
  model: string
  usage?: { inputTokens?: number; outputTokens?: number }
}
