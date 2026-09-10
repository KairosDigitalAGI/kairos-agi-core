import type { ContentItem, EditorialState } from '../../types/instagram'
const make = (id: string, title: string, stage: ContentItem['stage'], date: string): ContentItem => ({
  id, title, stage, date, theme: 'Empresa de agentes', category: 'Reel', priority: 'Alta',
  research: 'Exemplo editorial: demonstrar uma rotina repetitiva antes e depois da organização em missões.',
  script: 'Abertura: quanto tempo você perde organizando tarefas? Mostrar uma missão e a revisão do Founder. Encerrar com convite para conhecer a Kairos.',
  imageBrief: 'Frame vertical com painel da Kairos. Nenhum dado de cliente.',
  videoBrief: 'Reel de 30 segundos: abertura, demonstração e convite. Produção manual pendente.',
  caption: 'Uma empresa organizada começa com uma missão clara. Conheça os bastidores da Kairos Digital. #Kairos #Automação',
  approval: 'Pendente', revision: 1, approvedRevision: null, feedback: '', history: [],
})
export const editorialSeed: EditorialState = {
  version: 1,
  items: [
    make('IG-001', 'Bastidores da Founder Tower', 'Aprovação', '2026-09-14'),
    make('IG-002', 'Do briefing à missão', 'Roteiro', '2026-09-16'),
    { ...make('IG-003', 'O que um departamento IA entrega?', 'Ideia', ''), research: '', script: '', imageBrief: '', videoBrief: '', caption: '', priority: 'Média' },
  ],
  prompts: [
    { id: 'PR-001', title: 'Roteiro de Reel', category: 'Roteiro', body: 'Crie um roteiro de 30 segundos sobre {{tema}} para {{publico}}. Inclua gancho, demonstração e CTA. Não invente resultados nem depoimentos.' },
    { id: 'PR-002', title: 'Legenda com contexto', category: 'Legenda', body: 'Escreva uma legenda sobre {{tema}}, com benefício concreto, contexto e convite à conversa. Revise as afirmações antes da aprovação.' },
  ],
}
export const instagramAnalytics = [
  { label: 'Seguidores', value: '4.280' }, { label: 'Alcance', value: '18.400' },
  { label: 'Cliques', value: '620' }, { label: 'Leads', value: '38' }, { label: 'Posts publicados', value: '12' },
]
