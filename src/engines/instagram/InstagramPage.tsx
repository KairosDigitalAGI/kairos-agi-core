import { useState } from 'react'
import { Camera, Plus } from 'lucide-react'
import { useEditorial } from '../../core/EditorialProvider'
import { instagramProfile } from '../../data/operational'
import { SectionHeader } from '../../ui/SectionHeader'
import { ApprovalQueue } from './ApprovalQueue'
import { ContentEditor } from './ContentEditor'
import { PromptLibrary } from './PromptLibrary'
import { nextStepError, pipeline } from './domain'
import { disconnectedGateway } from './graphGateway'
const tabs = ['Pipeline', 'Calendário', 'Prompts', 'Aprovações', 'Analytics', 'Integração'] as const

export function InstagramPage() {
  const { state, dispatch, storageError } = useEditorial()
  const [tab, setTab] = useState<typeof tabs[number]>('Pipeline')
  const [editing, setEditing] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [priority, setPriority] = useState('Todas')
  const [notice, setNotice] = useState('')
  const items = state.items.filter(i => (priority === 'Todas' || i.priority === priority) && (i.title + ' ' + i.theme).toLocaleLowerCase().includes(query.toLocaleLowerCase()))
  const edit = state.items.find(i => i.id === editing)
  return <div className="page-stack editorial">
    <section className="instagram-hero">
      <div className="instagram-orb"><Camera size={30} /></div>
      <div><span className="eyebrow">Cliente Zero · Instagram Engine</span><h2><a href={instagramProfile.url} target="_blank" rel="noreferrer">@{instagramProfile.handle}</a></h2><p>Planeje, prepare e aprove conteúdos da Kairos.</p></div>
      <div className="ig-kpis"><span><strong>{state.items.length}</strong> conteúdos</span><span><strong>{state.items.filter(i => i.stage === 'Aprovação').length}</strong> para aprovar</span></div>
    </section>
    <p className="editorial-muted">Edição local neste navegador · sem sincronização entre dispositivos · API desconectada</p>
    {storageError && <p role="alert" className="editorial-alert">{storageError}</p>}
    <div className="editorial-tabs" aria-label="Seções do Instagram">{tabs.map(t => <button key={t} aria-pressed={tab === t} onClick={() => { setTab(t); setEditing(null); setNotice('') }}>{t}</button>)}</div>
    {editing !== null ? <ContentEditor key={editing} item={edit} onSaved={() => { setEditing(null); setNotice('Conteúdo salvo.'); }} onCancel={() => setEditing(null)} /> : <>
      {(tab === 'Pipeline' || tab === 'Calendário') && <div className="editorial-filters">
        <label>Buscar título ou tema<input type="search" value={query} onChange={e => setQuery(e.target.value)} /></label>
        <label>Prioridade<select value={priority} onChange={e => setPriority(e.target.value)}>{['Todas','Alta','Média','Baixa'].map(p => <option key={p}>{p}</option>)}</select></label>
        <button className="primary-button" onClick={() => setEditing('new')}><Plus size={16} /> Nova ideia</button>
      </div>}
      {tab === 'Pipeline' && <section className="editorial-pipeline">{pipeline.map(stage => <div key={stage} className="editorial-column">
        <h3>{stage}<span>{items.filter(i => i.stage === stage).length}</span></h3>
        {items.filter(i => i.stage === stage).map(item => <article className="editorial-card" key={item.id}>
          <span className="status-chip">{item.priority} · {item.category}</span><h4>{item.title}</h4><p>{item.theme}</p><p>{item.date || 'Sem data editorial'}</p>
          {item.feedback && <p className="editorial-feedback">Ajuste: {item.feedback}</p>}
          {stage === 'Publicação' && <p className="editorial-feedback">Aprovado · aguardando conexão. Não publicado.</p>}
          <div className="editorial-actions"><button onClick={() => setEditing(item.id)}>Editar</button>
            {stage === 'Aprovação' ? <button onClick={() => setTab('Aprovações')}>Revisar</button> : stage !== 'Publicação' && <button onClick={() => {
              const error = nextStepError(item)
              if (error) { setNotice(error); return }
              dispatch({ type: 'advance', id: item.id, at: new Date().toISOString() }); setNotice('Etapa atualizada.')
            }}>Avançar</button>}
          </div><details><summary>Histórico ({item.history.length})</summary>{item.history.length ? <ol>{item.history.map((h, n) => <li key={n}>{h.action} <small>{new Date(h.at).toLocaleString('pt-BR')}</small></li>)}</ol> : <p>Sem eventos registrados.</p>}</details>
        </article>)}
        {!items.some(i => i.stage === stage) && <p className="empty-editorial">Nenhum conteúdo</p>}
      </div>)}</section>}
      {tab === 'Calendário' && <section className="glass-panel">
        <SectionHeader eyebrow="Planejamento" title="Agenda editorial" />
        <p className="editorial-muted">As datas organizam o trabalho. Nenhuma publicação está agendada na Meta.</p>
        {items.length === 0 && <p>Nenhum conteúdo encontrado.</p>}
        {[...items].sort((a,b) => (a.date || '9999').localeCompare(b.date || '9999')).map(item => <article key={item.id} className="calendar-editorial">
          <time>{item.date ? new Date(item.date + 'T12:00:00').toLocaleDateString('pt-BR') : 'Sem data'}</time>
          <div><strong>{item.title}</strong><p>{item.category} · {item.stage}{item.stage === 'Publicação' ? ' · aguardando conexão' : ''}</p></div><button onClick={() => setEditing(item.id)}>Editar data e conteúdo</button>
        </article>)}
      </section>}
      {tab === 'Prompts' && <PromptLibrary />}
      {tab === 'Aprovações' && <ApprovalQueue />}
      {tab === 'Analytics' && <section className="glass-panel">
        <SectionHeader eyebrow="Instagram" title="Métricas da conta" />
        <p className="editorial-muted">Métricas indisponíveis: conta ainda não autenticada. O perfil foi informado pelo Founder; seguidores, alcance e publicações não foram consultados.</p>
        <div className="editorial-metrics">{['Seguidores', 'Alcance', 'Cliques', 'Leads', 'Posts publicados'].map(label => <article key={label}><span>{label}</span><strong>—</strong></article>)}</div>
      </section>}
      {tab === 'Integração' && <section className="glass-panel">
        <SectionHeader eyebrow="Instagram Graph API" title={disconnectedGateway.connected ? 'Conectada' : 'Desconectada'} />
        <p>O contrato de integração está preparado. Autenticação, tokens e publicação real serão implementados no servidor em uma missão futura.</p>
        <p>Nesta versão você prepara textos e briefings manualmente, reutiliza prompts e aprova revisões. Não há chamadas à Meta ou a modelos de IA.</p>
      </section>}
    </>}
    <p role="status" className="editorial-notice">{notice}</p>
  </div>
}
