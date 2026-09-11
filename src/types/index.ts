export type ModuleKey =
  | 'world'
  | 'agents'
  | 'dashboard'
  | 'missions'
  | 'clients'
  | 'crm'
  | 'instagram'
  | 'clone'
  | 'hunter'
  | 'money-lab'
  | 'analytics'
  | 'vault'
  | 'settings'

export type StatusTone = 'active' | 'attention' | 'idle'

export interface Metric {
  id: string
  label: string
  value: string
  delta: string
  tone: StatusTone
}

export interface FounderAgent {
  id: string
  name: string
  role: string
  status: 'Trabalhando' | 'Aguardando' | 'Em revisão'
  task: string
  progress: number
  color: string
  position: [number, number, number]
}

export interface Mission {
  id: string
  title: string
  category: string
  priority: 'Alta' | 'Média' | 'Baixa'
  status: 'Pendente' | 'Em andamento' | 'Concluída'
  xp: number
  coins: number
  owner: string
}

export interface CrmClient {
  id: `CLIENT_${string}`
  name: string
  company: string
  pipeline: 'Lead' | 'Qualificação' | 'Proposta' | 'Ativo'
  nextAction: string
  owner: string
  serviceOrder: string
}

export interface CoinTransaction {
  id: string
  label: string
  amount: number
  date: string
}

export interface FounderEconomy {
  balance: number
  xp: number
  level: number
  nextLevelXp: number
  history: CoinTransaction[]
}
