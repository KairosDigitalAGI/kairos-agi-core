import type { CrmClient, FounderAgent, FounderEconomy, Metric, Mission } from '../../types'

export const metrics: Metric[] = [
  { id: 'total-revenue', label: 'Receita total', value: 'R$ 84.920', delta: '+18,4%', tone: 'active' },
  { id: 'monthly-revenue', label: 'Receita mensal', value: 'R$ 12.480', delta: '+7,2%', tone: 'active' },
  { id: 'active-leads', label: 'Leads ativos', value: '128', delta: '+24 esta semana', tone: 'active' },
  { id: 'active-clients', label: 'Clientes ativos', value: '3', delta: '100% acompanhados', tone: 'idle' },
  { id: 'working-agents', label: 'Agentes trabalhando', value: '4', delta: 'Todos operacionais', tone: 'active' },
  { id: 'service-orders', label: 'Ordens de serviço', value: '9', delta: '3 em execução', tone: 'attention' },
  { id: 'pending-missions', label: 'Missões pendentes', value: '5', delta: '2 de alta prioridade', tone: 'attention' },
]

export const agents: FounderAgent[] = [
  {
    id: 'orion', name: 'ORION', role: 'CEO Operacional', status: 'Trabalhando',
    task: 'Organizando prioridades da empresa.', progress: 76, color: '#9b6cff', position: [-3.2, 0, -0.8],
  },
  {
    id: 'kairos', name: 'KAIROS', role: 'Robô do Founder', status: 'Trabalhando',
    task: 'Sincronizando CRM.', progress: 61, color: '#38bdf8', position: [-1.05, 0, 1.05],
  },
  {
    id: 'instagram-ai', name: 'Instagram AI', role: 'Social Engine', status: 'Em revisão',
    task: 'Gerando Reel 07/30.', progress: 23, color: '#f472b6', position: [1.25, 0, 0.35],
  },
  {
    id: 'hunter-ai', name: 'Hunter AI', role: 'Demand Network', status: 'Trabalhando',
    task: 'Pesquisando clínicas em Campinas.', progress: 48, color: '#34d399', position: [3.35, 0, -0.85],
  },
]

export const missions: Mission[] = [
  { id: 'MSN-001', title: 'Enviar logo', category: 'Marca', priority: 'Alta', status: 'Pendente', xp: 120, coins: 18, owner: 'Founder' },
  { id: 'MSN-002', title: 'Gravar vídeo', category: 'Conteúdo', priority: 'Alta', status: 'Em andamento', xp: 240, coins: 35, owner: 'Founder' },
  { id: 'MSN-003', title: 'Aprovar anúncio', category: 'Aquisição', priority: 'Média', status: 'Pendente', xp: 90, coins: 12, owner: 'ORION' },
  { id: 'MSN-004', title: 'Responder cliente', category: 'Comercial', priority: 'Alta', status: 'Pendente', xp: 80, coins: 10, owner: 'KAIROS' },
  { id: 'MSN-005', title: 'Conectar Instagram', category: 'Integração', priority: 'Média', status: 'Pendente', xp: 180, coins: 24, owner: 'Instagram AI' },
  { id: 'MSN-006', title: 'Criar componente reutilizável', category: 'Engenharia', priority: 'Baixa', status: 'Concluída', xp: 150, coins: 20, owner: 'KAIROS' },
]

export const crmClients: CrmClient[] = [
  { id: 'CLIENT_001', name: 'Contato 001', company: 'Empresa Alfa', pipeline: 'Qualificação', nextAction: 'Validar diagnóstico', owner: 'KAIROS', serviceOrder: 'OS-1042' },
  { id: 'CLIENT_002', name: 'Contato 002', company: 'Empresa Beta', pipeline: 'Proposta', nextAction: 'Revisar proposta', owner: 'ORION', serviceOrder: 'OS-1047' },
  { id: 'CLIENT_003', name: 'Contato 003', company: 'Empresa Gama', pipeline: 'Ativo', nextAction: 'Reunião de resultado', owner: 'Founder', serviceOrder: 'OS-1038' },
]

export const founderEconomy: FounderEconomy = {
  balance: 284,
  xp: 1680,
  level: 7,
  nextLevelXp: 2000,
  history: [
    { id: 'KC-01', label: 'Missão concluída · Componente reutilizável', amount: 20, date: 'Hoje, 14:32' },
    { id: 'KC-02', label: 'Sequência semanal', amount: 35, date: 'Ontem, 18:10' },
    { id: 'KC-03', label: 'Entrega aprovada · Site Maker', amount: 48, date: '08 set, 16:45' },
  ],
}

export const revenueSeries = [31, 42, 38, 58, 51, 67, 63, 82, 76, 94, 101, 118]

export const instagramQueue = [
  { id: 'IG-07', title: 'Reel · Bastidores da Kairos', stage: 'Gerando', progress: 68 },
  { id: 'IG-08', title: 'Carrossel · Agentes autônomos', stage: 'Roteiro', progress: 32 },
  { id: 'IG-09', title: 'Stories · Prova social', stage: 'Aguardando aprovação', progress: 84 },
]
