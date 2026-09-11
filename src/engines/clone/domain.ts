import type { CloneDraft, CloneState, CloneVideo, LibraryKind, LibraryRecord } from '../../types/clone'
import { libraryCatalog, providerIds, socialChannels } from './catalog.ts'
export const clonePipeline = ['Ideia', 'Roteiro', 'Prompt', 'Imagem', 'Vídeo', 'Legenda', 'Thumbnail', 'Aprovação Founder', 'Publicação'] as const
export const emptyClone: CloneState = { version: 1, edition: 'founder', libraryRevision: 0, records: [], videos: [] }
export const emptyCloneDraft: CloneDraft = { title: '', identityId: '', promptId: '', provider: 'manual', channels: ['Instagram'], script: '', imageAssetId: '', videoAssetId: '', caption: '', thumbnailAssetId: '' }
export type CloneAction =
  | { type: 'record'; id: string; kind: LibraryKind; name: string; fields: Record<string, string>; at: string }
  | { type: 'save'; id: string; draft: CloneDraft; at: string }
  | { type: 'advance'; id: string; at: string }
  | { type: 'approve'; id: string; at: string }
  | { type: 'revise'; id: string; feedback: string; at: string }

export function recordError(kind: LibraryKind, name: string, fields: Record<string, string>): string {
  if (!name.trim()) return 'Informe um nome.'
  if (!Object.hasOwn(libraryCatalog, kind)) return 'Tipo de registro inválido.'
  const config = libraryCatalog[kind]
  for (const field of config.fields) {
    if (field.required && !fields[field.key]?.trim()) return `Preencha: ${field.label}.`
    if (field.options && !field.options.includes(fields[field.key])) return `Selecione: ${field.label}.`
  }
  return ''
}
function findRecord(state: CloneState, id: string, kind: LibraryKind) { return state.records.find(r => r.id === id && r.kind === kind) }
export function stageRequirement(state: CloneState, video: CloneVideo, stage = video.stage): string {
  const identity = findRecord(state, video.identityId, 'identity')
  const asset = (id: string, type: string) => { const record = findRecord(state, id, 'asset'); return record?.fields.type === type && !!record.fields.rights?.trim() }
  switch (stage) {
    case 'Ideia': return identity?.fields.consent === 'Autorizado' ? '' : 'Cadastre e selecione uma identidade autorizada.'
    case 'Roteiro': return video.script.trim() ? '' : 'Preencha o roteiro.'
    case 'Prompt': return findRecord(state, video.promptId, 'prompt') ? '' : 'Selecione um prompt cadastrado.'
    case 'Imagem': return asset(video.imageAssetId, 'Imagem') ? '' : 'Selecione uma imagem real catalogada com seus direitos de uso.'
    case 'Vídeo': return asset(video.videoAssetId, 'Vídeo') ? '' : 'Selecione um vídeo real catalogado. Geração automática desconectada.'
    case 'Legenda': return video.caption.trim() ? '' : 'Preencha a legenda.'
    case 'Thumbnail': return asset(video.thumbnailAssetId, 'Thumbnail') ? '' : 'Selecione uma thumbnail real catalogada.'
    case 'Aprovação Founder': return 'A revisão do Founder é obrigatória.'
    case 'Publicação': return 'Publicação desconectada. Nenhum conteúdo foi publicado.'
  }
}
export function approvalError(state: CloneState, video: CloneVideo): string {
  for (const stage of clonePipeline.slice(0, 7)) { const error = stageRequirement(state, video, stage); if (error) return error }
  return ''
}
function validDraft(draft: CloneDraft) {
  return Object.keys(emptyCloneDraft).filter(k => k !== 'channels').every(k => typeof draft[k as keyof CloneDraft] === 'string') &&
    !!draft.title.trim() && providerIds.some(p => p === draft.provider) && Array.isArray(draft.channels) && draft.channels.length > 0 &&
    draft.channels.every(c => socialChannels.includes(c)) && new Set(draft.channels).size === draft.channels.length
}
export function cloneReducer(state: CloneState, action: CloneAction): CloneState {
  if (action.type === 'record') {
    if (recordError(action.kind, action.name, action.fields)) return state
    const existing = state.records.find(r => r.id === action.id)
    if (existing && existing.kind !== action.kind) return state
    const record: LibraryRecord = { id: action.id, kind: action.kind, name: action.name.trim(), fields: { ...action.fields }, revision: (existing?.revision || 0) + 1, updatedAt: action.at }
    return { ...state, libraryRevision: state.libraryRevision + 1, records: existing ? state.records.map(r => r.id === record.id ? record : r) : [...state.records, record],
      videos: state.videos.map(v => v.approvedRevision === null ? v : { ...v, approvedRevision: null, approvedLibraryRevision: null, stage: 'Roteiro', history: [...v.history, { at: action.at, action: 'Biblioteca alterada; aprovação invalidada.' }] }) }
  }
  if (action.type === 'save') {
    if (!validDraft(action.draft)) return state
    const existing = state.videos.find(v => v.id === action.id)
    const draft = Object.fromEntries(Object.keys(emptyCloneDraft).map(k => [k, action.draft[k as keyof CloneDraft]])) as unknown as CloneDraft
    const video: CloneVideo = { ...draft, title: draft.title.trim(), id: action.id, revision: (existing?.revision || 0) + 1, stage: 'Ideia', approvedRevision: null, approvedLibraryRevision: null, feedback: existing?.feedback || '', history: [...(existing?.history || []), { at: action.at, action: existing ? 'Conteúdo editado; etapas e aprovação devem ser revisadas.' : 'Ideia cadastrada pelo Founder.' }] }
    return { ...state, videos: existing ? state.videos.map(v => v.id === video.id ? video : v) : [...state.videos, video] }
  }
  const video = state.videos.find(v => v.id === action.id)
  if (!video) return state
  let updated: CloneVideo
  if (action.type === 'advance') {
    if (stageRequirement(state, video)) return state
    updated = { ...video, stage: clonePipeline[clonePipeline.indexOf(video.stage) + 1] }
  } else if (action.type === 'approve') {
    if (video.stage !== 'Aprovação Founder' || approvalError(state, video)) return state
    updated = { ...video, stage: 'Publicação', approvedRevision: video.revision, approvedLibraryRevision: state.libraryRevision, feedback: '' }
  } else {
    if (video.stage !== 'Aprovação Founder' || !action.feedback.trim()) return state
    updated = { ...video, stage: 'Roteiro', approvedRevision: null, approvedLibraryRevision: null, feedback: action.feedback.trim() }
  }
  updated.history = [...video.history, { at: action.at, action: action.type === 'approve' ? 'Revisão aprovada localmente; aguardando publicação externa.' : action.type === 'revise' ? `Revisão solicitada: ${action.feedback}` : `Etapa: ${updated.stage}` }]
  return { ...state, videos: state.videos.map(v => v.id === updated.id ? updated : v) }
}
export function parseClone(raw: string): CloneState {
  const s = JSON.parse(raw)
  const integer = (n: unknown) => Number.isSafeInteger(n) && Number(n) >= 0
  if (!s || s.version !== 1 || s.edition !== 'founder' || !integer(s.libraryRevision) || !Array.isArray(s.records) || !Array.isArray(s.videos)) throw new Error('Formato do Clone inválido.')
  for (const r of s.records) {
    if (!r || typeof r.id !== 'string' || !r.id || typeof r.name !== 'string' || !r.fields || typeof r.fields !== 'object' || Array.isArray(r.fields) || !Object.values(r.fields).every(v => typeof v === 'string') || !integer(r.revision) || r.revision < 1 || typeof r.updatedAt !== 'string' || recordError(r.kind, r.name, r.fields)) throw new Error('Registro inválido.')
  }
  for (const v of s.videos) {
    if (!v || typeof v.id !== 'string' || !v.id || !validDraft(v) || !clonePipeline.includes(v.stage) || !integer(v.revision) || v.revision < 1 || typeof v.feedback !== 'string' || !Array.isArray(v.history) || !v.history.every((h: { at: unknown; action: unknown }) => h && typeof h.at === 'string' && typeof h.action === 'string')) throw new Error('Vídeo inválido.')
    if (v.stage === 'Publicação' ? v.approvedRevision !== v.revision || v.approvedLibraryRevision !== s.libraryRevision || approvalError(s, v) : v.approvedRevision !== null || v.approvedLibraryRevision !== null) throw new Error('Aprovação inválida.')
  }
  if (new Set(s.records.map((r: LibraryRecord) => r.id)).size !== s.records.length || new Set(s.videos.map((v: CloneVideo) => v.id)).size !== s.videos.length) throw new Error('Identificadores duplicados.')
  return s
}
