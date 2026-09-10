import { useState, type FormEvent } from 'react'
import { useEditorial } from '../../core/EditorialProvider'
import type { ContentDraft, ContentItem } from '../../types/instagram'
import { emptyDraft } from './domain'
const fields = [['research', 'Pesquisa e referências'], ['script', 'Roteiro'], ['imageBrief', 'Briefing da imagem'], ['videoBrief', 'Briefing do vídeo'], ['caption', 'Legenda']] as const
export function ContentEditor({ item, onSaved, onCancel }: { item?: ContentItem; onSaved: () => void; onCancel: () => void }) {
  const { dispatch } = useEditorial()
  const [draft, setDraft] = useState<ContentDraft>(item || emptyDraft)
  const change = (key: keyof ContentDraft, value: string) => setDraft(d => ({ ...d, [key]: value }))
  const save = (e: FormEvent) => {
    e.preventDefault()
    if (!draft.title.trim() || !draft.theme.trim()) return
    dispatch({ type: 'save', id: item?.id || crypto.randomUUID(), draft, at: new Date().toISOString() }); onSaved()
  }
  return <form className="glass-panel editorial editor-form" onSubmit={save}>
    <h3>{item ? 'Editar conteúdo' : 'Nova ideia'}</h3>
    {item?.approvedRevision && <p>Salvar uma alteração exigirá uma nova aprovação.</p>}
    <div className="editor-fields">
      <label>Título<input autoFocus required maxLength={160} value={draft.title} onChange={e => change('title', e.target.value)} /></label>
      <label>Tema<input required maxLength={160} value={draft.theme} onChange={e => change('theme', e.target.value)} /></label>
      <label>Categoria<select value={draft.category} onChange={e => change('category', e.target.value)}>{['Reel','Carrossel','Story','Post'].map(v => <option key={v}>{v}</option>)}</select></label>
      <label>Prioridade<select value={draft.priority} onChange={e => change('priority', e.target.value)}>{['Alta','Média','Baixa'].map(v => <option key={v}>{v}</option>)}</select></label>
      <label>Data editorial<input type="date" value={draft.date} onChange={e => change('date', e.target.value)} /></label>
    </div>
    {fields.map(([key, label]) => <label key={key}>{label}<textarea maxLength={10000} rows={3} value={draft[key]} onChange={e => change(key, e.target.value)} /></label>)}
    <div className="editorial-actions"><button type="submit" className="primary-button">Salvar conteúdo</button><button type="button" onClick={onCancel}>Cancelar</button></div>
  </form>
}
