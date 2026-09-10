import { useState, type FormEvent } from 'react'
import { useEditorial } from '../../core/EditorialProvider'
import { SectionHeader } from '../../ui/SectionHeader'
import type { PromptTemplate } from '../../types/instagram'
export function PromptLibrary() {
  const { state, dispatch } = useEditorial()
  const [draft, setDraft] = useState<PromptTemplate>({ id: '', title: '', category: 'Roteiro', body: '' })
  const [notice, setNotice] = useState('')
  const save = (e: FormEvent) => {
    e.preventDefault()
    if (!draft.title.trim() || !draft.body.trim()) return
    dispatch({ type: 'prompt', prompt: { ...draft, id: draft.id || crypto.randomUUID() } })
    setDraft({ id: '', title: '', category: 'Roteiro', body: '' }); setNotice('Prompt salvo.')
  }
  return <section className="glass-panel editorial">
    <SectionHeader eyebrow="Biblioteca" title="Prompts reutilizáveis" />
    <p className="editorial-muted">Use os modelos como ponto de partida. Copiar um prompt não executa um modelo de IA.</p>
    <div className="prompt-grid">{state.prompts.map(p => <article key={p.id} className="prompt-card">
      <span className="status-chip">{p.category}</span><h3>{p.title}</h3><pre>{p.body}</pre>
      <div className="editorial-actions"><button onClick={() => setDraft(p)}>Editar</button><button onClick={async () => { try { await navigator.clipboard.writeText(p.body); setNotice('Prompt copiado.') } catch { setNotice('Cópia indisponível. Selecione o texto do prompt para copiar manualmente.') } }}>Copiar</button></div>
    </article>)}</div>
    <form className="editor-form" onSubmit={save}>
      <h3>{draft.id ? 'Editar prompt' : 'Novo prompt'}</h3><div className="editor-fields">
        <label>Nome do prompt<input required maxLength={160} value={draft.title} onChange={e => setDraft({ ...draft, title: e.target.value })} /></label>
        <label>Categoria do prompt<select value={draft.category} onChange={e => setDraft({ ...draft, category: e.target.value })}>{['Pesquisa','Roteiro','Imagem','Vídeo','Legenda'].map(v => <option key={v}>{v}</option>)}</select></label>
      </div><label>Texto do prompt<textarea required maxLength={10000} value={draft.body} rows={5} onChange={e => setDraft({ ...draft, body: e.target.value })} /></label>
      <div className="editorial-actions"><button className="primary-button">Salvar prompt</button>{draft.id && <button type="button" onClick={() => setDraft({ id: '', title: '', category: 'Roteiro', body: '' })}>Cancelar edição</button>}</div>
    </form><p role="status">{notice}</p>
  </section>
}
