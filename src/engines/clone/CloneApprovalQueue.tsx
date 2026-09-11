import { useState } from 'react'
import { useClone } from '../../core/CloneProvider'
import type { CloneVideo } from '../../types/clone'
import { approvalError } from './domain'
import { SectionHeader } from '../../ui/SectionHeader'
function ApprovalCard({ video }: { video: CloneVideo }) {
  const { state, dispatch } = useClone()
  const [feedback, setFeedback] = useState('')
  const [reviewed, setReviewed] = useState(false)
  const error = approvalError(state, video)
  const reference = (id: string) => { const r = state.records.find(record => record.id === id); return r ? `${r.name} · v${r.revision}\n${Object.values(r.fields).join('\n')}` : 'Não cadastrado' }
  const materials = { Identidade: reference(video.identityId), Roteiro: video.script, Prompt: reference(video.promptId), Imagem: reference(video.imageAssetId), Vídeo: reference(video.videoAssetId), Legenda: video.caption, Thumbnail: reference(video.thumbnailAssetId) }
  return <article className="approval-card"><h3>{video.title} · v{video.revision}</h3><p>{video.channels.join(' · ')} · Engine planejada: {video.provider}</p>
    <dl>{Object.entries(materials).map(([name, value]) => <div key={name}><dt>{name}</dt><dd>{value || 'Não preenchido'}</dd></div>)}</dl>
    <p>Os arquivos são referências locais e não foram abertos pela plataforma. Confira os arquivos originais antes de aprovar.</p>
    <label className="clone-confirm"><input type="checkbox" checked={reviewed} onChange={e => setReviewed(e.target.checked)} />Conferi os materiais originais e a autorização de uso.</label>
    {error && <p role="alert">{error}</p>}
    <label>Ajustes solicitados<textarea value={feedback} maxLength={4000} onChange={e => setFeedback(e.target.value)} /></label>
    <div className="editorial-actions"><button className="primary-button" disabled={!!error || !reviewed} onClick={() => dispatch({ type: 'approve', id: video.id, at: new Date().toISOString() })}>Aprovar revisão</button><button disabled={!feedback.trim()} onClick={() => dispatch({ type: 'revise', id: video.id, feedback, at: new Date().toISOString() })}>Solicitar ajustes</button></div>
  </article>
}
export function CloneApprovalQueue() {
  const { state, error } = useClone()
  const waiting = state.videos.filter(v => v.stage === 'Aprovação Founder')
  return <section className="glass-panel editorial"><SectionHeader eyebrow="Clone Engine" title="Aprovações do Founder" />{error && <p role="alert" className="editorial-alert">{error}</p>}
    {!waiting.length && <p>Nenhuma produção do Clone aguardando aprovação.</p>}
    {waiting.map(video => <ApprovalCard key={`${video.id}:${video.revision}:${state.libraryRevision}`} video={video} />)}
  </section>
}
