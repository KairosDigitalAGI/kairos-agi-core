import { useState } from 'react'
import { useEditorial } from '../../core/EditorialProvider'
import type { ContentItem } from '../../types/instagram'
import { SectionHeader } from '../../ui/SectionHeader'

function ApprovalCard({ item }: { item: ContentItem }) {
  const { dispatch } = useEditorial()
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState('')
  const complete = [item.research, item.script, item.imageBrief, item.videoBrief, item.caption].every(value => value.trim())
  const decide = (type: 'approve' | 'revise') => {
    if (type === 'revise' && !feedback.trim()) { setError('Descreva o ajuste solicitado.'); return }
    dispatch({ type, id: item.id, at: new Date().toISOString(), feedback })
  }
  return <article className="approval-card">
    <div className="editorial-row"><h3>{item.title}</h3><span className="status-chip">Revisão {item.revision}</span></div>
    <p>{item.category} · {item.theme} · {item.date || 'Sem data'}</p>
    <dl>{[['Pesquisa', item.research], ['Roteiro', item.script], ['Imagem — briefing', item.imageBrief], ['Vídeo — briefing', item.videoBrief], ['Legenda', item.caption]].map(([label, value]) =>
      <div key={label}><dt>{label}</dt><dd>{value || 'Não informado'}</dd></div>)}</dl>
    <label>Ajustes para a próxima revisão<textarea value={feedback} maxLength={2000} onChange={e => setFeedback(e.target.value)} /></label>
    {error && <p role="alert">{error}</p>}
    {!complete && <p role="alert">Preencha todos os materiais no editor do Instagram antes de aprovar.</p>}
    <div className="editorial-actions"><button disabled={!complete} className="primary-button" onClick={() => decide('approve')}>Aprovar revisão {item.revision}</button><button onClick={() => decide('revise')}>Solicitar ajustes</button></div>
  </article>
}
export function ApprovalQueue() {
  const { state, storageError } = useEditorial()
  const pending = state.items.filter(i => i.stage === 'Aprovação')
  return <section className="glass-panel editorial approval-queue">
    <SectionHeader eyebrow="Decisões do Founder" title="Aprovações de conteúdo" action={<span className="count-badge">{pending.length}</span>} />
    <p className="editorial-muted">Revise o material antes de aprovar. Imagens e vídeos são briefings nesta versão; não há geração nem publicação automática.</p>
    {storageError && <p role="alert">{storageError}</p>}
    {pending.length ? pending.map(item => <ApprovalCard key={item.id + ':' + item.revision} item={item} />) : <p className="empty-editorial">Nenhum conteúdo aguardando decisão.</p>}
  </section>
}
