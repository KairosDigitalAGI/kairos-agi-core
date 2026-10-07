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

export type ContentJobEtapa =
  | 'ideia'
  | 'roteiro'
  | 'imagem'
  | 'video'
  | 'legenda'
  | 'aprovacao'
  | 'publicado'
  | 'rejeitado'

export interface ContentJob {
  id: string
  titulo: string
  etapa: ContentJobEtapa
  aprovado: boolean
  criado_em: string
}

export interface ContentPipelineResponse {
  source: DataSource
  checkedAt?: string
  reason?: string
  jobs: ContentJob[]
  assets: ContentAsset[]
  porEtapa: Partial<Record<ContentJobEtapa, number>>
}

export interface ContentAsset {
  id: string
  job_id: string
  tipo: 'roteiro' | 'imagem' | 'video' | string
  storage_path: string | null
  url: string | null
  provedor: string | null
  gratuito: boolean | null
  metadata: { model?: string; usage?: unknown; input?: string } | null
  criado_em: string
}

export interface SeedanceReadinessResponse {
  checkedAt: string
  model: string
  contentStoreReady: boolean
  contentStoreReason?: string | null
  storageReady: boolean
  storageReason?: string | null
  featureEnabled: boolean
  gatewayAuthenticated: boolean
  requiresApprovedJob: boolean
  budgetCapUsd: number
}

// Avatar Studio (Fase 9) — identidade vem de src/data/agentRegistry.json,
// progresso vem de command.avatars. hasProgress:false = agente ainda sem
// linha gravada no Supabase, nivel/xp/coins mostrados são o baseline (1/0/0),
// nunca um número fabricado.
export interface AvatarProgress {
  slug: string
  name: string
  role: string
  department: string
  hasProgress: boolean
  nivel: number
  xp: number
  coins: number
  conquistas: unknown[]
  atualizadoEm: string | null
}

export interface AvatarStudioResponse {
  source: DataSource
  checkedAt?: string
  reason?: string
  avatars: AvatarProgress[]
}

// Story Engine (Fase 10)
export interface StoryNarrativeResponse {
  source: DataSource
  checkedAt?: string
  reason?: string
  narrative?: string
  provider?: string
}

export interface AgentActivityItem {
  jobId: string
  titulo: string
  etapa: ContentJobEtapa
  atualizadoEm: string
  agente: { slug: string; name: string; department: string }
}

export interface AgentActivityResponse {
  source: DataSource
  checkedAt?: string
  reason?: string
  activity: AgentActivityItem[]
}

// Mapa do Projeto (Fase 14) — diário de bordo append-only do próprio
// desenvolvimento (command.project_log), nunca editado/apagado por este
// projeto. `agent` é quem registrou a entrada, não um agente do organograma.
export type ProjectLogAgent = 'claude-code' | 'codex' | 'founder'
export type ProjectLogType = 'done' | 'todo' | 'idea' | 'bug'

export interface ProjectLogEntry {
  id: string
  created_at: string
  agent: ProjectLogAgent
  phase: string | null
  type: ProjectLogType
  title: string
  description: string | null
  commit: string | null
  deployed: boolean
}

export interface ProjectLogResponse {
  source: DataSource
  checkedAt?: string
  reason?: string
  entries: ProjectLogEntry[]
}

export interface CrmLead {
  id: string
  source: 'kairos_whatsapp'
  source_ref: string
  name: string | null
  phone: string | null
  state: string
  score: number
  contacted: boolean
  meeting_scheduled: boolean
  lead_type: string | null
  attempts: number
  niche: string | null
  city: string | null
  origin: string | null
  priority: string | null
  runtime_status: string | null
  history_count: number
  last_message_at: string | null
  source_created_at: string | null
  source_updated_at: string | null
  synced_at: string
}

export interface CrmEvent {
  id: string
  event_ref: string
  lead_source_ref: string
  event_type: 'classification' | 'inbound_message' | 'outbound_message' | 'delivery' | 'blocked' | 'unblocked' | 'state_changed' | 'score_changed' | 'meeting' | 'error'
  direction: 'inbound' | 'outbound' | 'system'
  status: 'received' | 'queued' | 'sent' | 'delivered' | 'read' | 'failed' | 'blocked' | 'ignored' | 'applied'
  summary: string | null
  metadata: Record<string, unknown>
  occurred_at: string
  synced_at: string
}

export interface DevRequest {
  id: string
  created_at: string
  updated_at: string
  source: string
  title: string
  description: string
  impact: string | null
  evidence: string | null
  proposed_solution: string | null
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'awaiting_confirmation' | 'pending' | 'triaged' | 'in_progress' | 'blocked' | 'done' | 'error' | 'rejected'
  assigned_to: 'codex' | 'claude-code' | 'founder' | null
  resolution: string | null
}

export interface CrmResponse {
  source: DataSource
  checkedAt: string
  leads: CrmLead[]
  requests: DevRequest[]
  events: CrmEvent[]
  eventStats: { total: number; delivered: number; blocked: number; resumed: number; failed: number }
  runtime: { source: 'crm_projection' | 'unavailable'; eligible: number; contacted: number; invalid: number; inbound: number; outbound: number; delivered: number; blocked: number; failed: number; lastSyncedAt: string | null }
  stats: { total: number; contacted: number; active: number; qualified: number; meetings: number }
}
