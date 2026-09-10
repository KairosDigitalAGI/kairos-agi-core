import type { ContentDraft, ContentItem, EditorialState, PromptTemplate } from '../../types/instagram'
export const pipeline = ['Ideia', 'Pesquisa', 'Roteiro', 'Imagem', 'Vídeo', 'Legenda', 'Aprovação', 'Publicação'] as const
export const emptyDraft: ContentDraft = { title: '', theme: '', category: 'Reel', priority: 'Média', date: '', research: '', script: '', imageBrief: '', videoBrief: '', caption: '' }
export type EditorialAction =
  | { type: 'save'; id: string; draft: ContentDraft; at: string }
  | { type: 'advance'; id: string; at: string }
  | { type: 'approve' | 'revise'; id: string; at: string; feedback?: string }
  | { type: 'prompt'; prompt: PromptTemplate }

export function nextStepError(item: ContentItem): string | null {
  const requirements: Partial<Record<ContentItem['stage'], string>> = {
    Ideia: item.theme, Pesquisa: item.research, Roteiro: item.script,
    Imagem: item.imageBrief, Vídeo: item.videoBrief, Legenda: item.caption,
  }
  if (item.stage === 'Publicação') return 'API desconectada. O conteúdo aprovado permanece na fila, sem publicar.'
  if (item.stage === 'Aprovação') return 'A decisão precisa ser feita pelo Founder no painel de aprovação.'
  return requirements[item.stage]?.trim() ? null : 'Preencha o material desta etapa antes de avançar.'
}
export function editorialReducer(state: EditorialState, action: EditorialAction): EditorialState {
  if (action.type === 'prompt') {
    if (!action.prompt.title.trim() || !action.prompt.body.trim()) return state
    return { ...state, prompts: [...state.prompts.filter(p => p.id !== action.prompt.id), action.prompt] }
  }
  const previous = state.items.find(i => i.id === action.id)
  let item: ContentItem
  if (action.type === 'save') {
    if (!action.draft.title.trim() || !action.draft.theme.trim()) return state
    item = previous ? {
      ...previous, ...action.draft, revision: previous.revision + 1, approval: 'Pendente', approvedRevision: null,
      stage: previous.stage === 'Publicação' ? 'Legenda' : previous.stage,
    } : { ...action.draft, id: action.id, stage: 'Ideia', revision: 1, approval: 'Pendente', approvedRevision: null, feedback: '', history: [] }
  } else {
    if (!previous) return state
    item = { ...previous }
    if (action.type === 'advance') {
      if (nextStepError(item)) return state
      item.stage = pipeline[pipeline.indexOf(item.stage) + 1]
      item.approval = 'Pendente'
    } else if (action.type === 'approve') {
      if (item.stage !== 'Aprovação' || ![item.research, item.script, item.imageBrief, item.videoBrief, item.caption].every(s => s.trim())) return state
      item.approval = 'Aprovado'; item.approvedRevision = item.revision; item.stage = 'Publicação'; item.feedback = ''
    } else {
      if (item.stage !== 'Aprovação' || !action.feedback?.trim()) return state
      item.approval = 'Revisão'; item.stage = 'Roteiro'; item.feedback = action.feedback; item.approvedRevision = null
    }
  }
  const labels = { save: previous ? 'Conteúdo editado; aprovação invalidada' : 'Ideia criada', advance: 'Etapa: ' + item.stage, approve: 'Founder aprovou revisão ' + item.revision + '; aguardando publicação', revise: 'Founder solicitou revisão: ' + (item.feedback || '') }
  item.history = [...item.history, { at: action.at, action: labels[action.type] }]
  return { ...state, items: previous ? state.items.map(i => i.id === item.id ? item : i) : [...state.items, item] }
}
export function parseEditorial(raw: string): EditorialState {
  const data = JSON.parse(raw)
  const strings = ['id','title','theme','category','date','research','script','imageBrief','videoBrief','caption','feedback']
  if (data?.version !== 1 || !Array.isArray(data.items) || !Array.isArray(data.prompts)) throw new Error('Formato incompatível')
  for (const i of data.items) {
    if (!i || !strings.every(k => typeof i[k] === 'string') || !pipeline.includes(i.stage)
      || !['Alta','Média','Baixa'].includes(i.priority) || !['Pendente','Aprovado','Revisão'].includes(i.approval)
      || !Number.isInteger(i.revision) || i.revision < 1
      || !(i.approvedRevision === null || Number.isInteger(i.approvedRevision))
      || !Array.isArray(i.history) || !i.history.every((h: { at: unknown; action: unknown }) => h && typeof h.at === 'string' && typeof h.action === 'string')
      || (i.stage === 'Publicação' && (i.approval !== 'Aprovado' || i.approvedRevision !== i.revision))) throw new Error('Conteúdo inválido')
  }
  for (const p of data.prompts) if (!p || !['id','title','category','body'].every(k => typeof p[k] === 'string')) throw new Error('Prompt inválido')
  if (new Set(data.items.map((i: ContentItem) => i.id)).size !== data.items.length) throw new Error('IDs duplicados')
  return data as EditorialState
}
