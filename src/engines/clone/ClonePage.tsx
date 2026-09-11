import { useState } from 'react'
import { useClone } from '../../core/CloneProvider'
import { LibraryPanel } from '../../features/libraries/LibraryPanel'
import type { LibraryKind } from '../../types/clone'
import { libraryCatalog } from './catalog'
import { clonePipeline, stageRequirement } from './domain'
import { VideoEditor } from './VideoEditor'
import { CloneApprovalQueue } from './CloneApprovalQueue'
import { videoProviders } from './videoProvider'
import './clone.css'
export function ClonePage() {
  const { state, dispatch, error } = useClone()
  const [tab, setTab] = useState<LibraryKind | 'queue' | 'approval' | 'providers'>('queue')
  const [editing, setEditing] = useState<string | null>(null)
  const [notice, setNotice] = useState('')
  const exportCatalog = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }))
    const a = document.createElement('a'); a.href = url; a.download = `kairos-clone-${new Date().toISOString().slice(0, 10)}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  return <div className="page-stack editorial clone-engine"><section className="glass-panel"><div className="editorial-row"><div><span className="eyebrow">Founder Edition · Missão 003</span><h2>Clone Engine</h2><p>Identidade, materiais e revisão do seu conteúdo.</p></div><button onClick={exportCatalog}>Exportar catálogo local</button></div>
    <p className="editorial-muted">{state.records.length} registros · {state.videos.length} produções cadastradas neste navegador. Sem geração, upload ou publicação automática.</p>
  </section>{error && <p role="alert" className="editorial-alert">{error}</p>}
    <nav className="editorial-tabs" aria-label="Módulos do Clone">{([['queue','Video Queue'], ...Object.entries(libraryCatalog).map(([key, value]) => [key, value.label]), ['approval','Approval Queue'], ['providers','Video Providers']] as [typeof tab, string][]).map(([key,label]) => <button key={key} aria-pressed={tab === key} onClick={() => { setTab(key); setEditing(null); setNotice('') }}>{label}</button>)}</nav>
    {tab in libraryCatalog && <LibraryPanel key={tab} kind={tab as LibraryKind} />}
    {tab === 'approval' && <CloneApprovalQueue />}
    {tab === 'providers' && <section className="glass-panel"><h3>Engines preparadas para conexão futura</h3><p>Escolher uma engine apenas registra a intenção. Nenhum serviço é chamado, nenhum crédito é consumido.</p><div className="prompt-grid">{videoProviders.map(provider => <article className="prompt-card" key={provider.id}><h3>{provider.id}</h3><p>{provider.id === 'manual' ? 'Catálogo de arquivos produzidos por você.' : 'Adaptador arquitetural desconectado.'}</p></article>)}</div></section>}
    {tab === 'queue' && (editing !== null ? <VideoEditor key={editing} video={state.videos.find(v => v.id === editing)} close={() => setEditing(null)} /> : <>
      <div className="editorial-row"><h3>Pipeline do Clone</h3><button className="primary-button" onClick={() => setEditing('new')}>Nova produção</button></div>
      {!state.videos.length && <p>Comece cadastrando sua identidade autorizada. Depois crie uma produção e vincule os materiais reais.</p>}
      <section className="editorial-pipeline">{clonePipeline.map(stage => <div className="editorial-column" key={stage}><h3>{stage}<span>{state.videos.filter(v => v.stage === stage).length}</span></h3>
        {state.videos.filter(v => v.stage === stage).map(video => <article className="editorial-card" key={video.id}><h4>{video.title}</h4><p>v{video.revision} · {video.channels.join(', ')}</p>{video.feedback && <p>Ajustes: {video.feedback}</p>}{stage === 'Publicação' && <p>Aprovado localmente. Não publicado.</p>}
          <div className="editorial-actions"><button onClick={() => setEditing(video.id)}>Editar</button>{stage === 'Aprovação Founder' ? <button onClick={() => setTab('approval')}>Revisar</button> : stage !== 'Publicação' && <button onClick={() => { const issue = stageRequirement(state, video); if (issue) { setNotice(issue); return }; dispatch({ type: 'advance', id: video.id, at: new Date().toISOString() }); setNotice('') }}>Avançar</button>}</div>
          <details><summary>Histórico</summary><ol>{video.history.map((event,index) => <li key={index}>{event.action}<small>{new Date(event.at).toLocaleString('pt-BR')}</small></li>)}</ol></details>
        </article>)}
        {!state.videos.some(v => v.stage === stage) && <p className="empty-editorial">Nenhuma produção</p>}
      </div>)}</section>
    </>)}<p role="status" className="editorial-notice">{notice}</p>
  </div>
}
