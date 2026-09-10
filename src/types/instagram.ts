export type Stage = 'Ideia' | 'Pesquisa' | 'Roteiro' | 'Imagem' | 'Vídeo' | 'Legenda' | 'Aprovação' | 'Publicação'
export type Approval = 'Pendente' | 'Aprovado' | 'Revisão'
export interface ContentItem {
  id: string; title: string; theme: string; category: string
  priority: 'Alta' | 'Média' | 'Baixa'; date: string; stage: Stage
  research: string; script: string; imageBrief: string; videoBrief: string; caption: string
  approval: Approval; revision: number; approvedRevision: number | null
  feedback: string; history: { at: string; action: string }[]
}
export interface PromptTemplate { id: string; title: string; category: string; body: string }
export interface EditorialState { version: 1; items: ContentItem[]; prompts: PromptTemplate[] }
export type ContentDraft = Pick<ContentItem, 'title' | 'theme' | 'category' | 'priority' | 'date' | 'research' | 'script' | 'imageBrief' | 'videoBrief' | 'caption'>
