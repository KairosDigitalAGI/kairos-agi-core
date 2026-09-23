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
  porEtapa: Partial<Record<ContentJobEtapa, number>>
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

// Estúdio Kairos (Fase 16) — personagem/reel/cena, mesma convenção de fonte
// real vs. indisponível de todo o resto do Painel: nunca lista fabricada
// enquanto a migration 0025 não é aplicada.
export type ReelEtapa = 'ideia' | 'roteiro' | 'cenas' | 'aprovacao' | 'producao' | 'pronto' | 'publicado' | 'rejeitado'

export interface StudioCharacter {
  id: string
  nome: string
  descricao: string | null
  prompt_visual: string
  imagem_referencia_path: string | null
  status: 'rascunho' | 'ativo' | 'arquivado'
  criado_em: string
}

export interface StudioReel {
  id: string
  titulo: string
  character_id: string | null
  etapa: ReelEtapa
  aprovado: boolean
  custo_estimado_usd: number | null
  criado_em: string
}

export interface StudioScene {
  id: string
  reel_id: string
  ordem: number
  roteiro: string | null
  prompt_video: string | null
  imagem_path: string | null
  video_path: string | null
  status: 'rascunho' | 'gerando_imagem' | 'gerando_video' | 'pronta' | 'erro'
}

export interface StudioCharactersResponse {
  source: DataSource
  reason?: string
  characters: StudioCharacter[]
}

export interface StudioReelsResponse {
  source: DataSource
  reason?: string
  reels: StudioReel[]
}

export interface StudioScenesResponse {
  source: DataSource
  reason?: string
  scenes: StudioScene[]
}

export interface ProjectLogResponse {
  source: DataSource
  checkedAt?: string
  reason?: string
  entries: ProjectLogEntry[]
}
