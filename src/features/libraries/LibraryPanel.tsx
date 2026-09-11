import { useState } from 'react'
import { useClone } from '../../core/CloneProvider'
import { libraryCatalog } from '../../engines/clone/catalog'
import { recordError } from '../../engines/clone/domain'
import type { LibraryKind, LibraryRecord } from '../../types/clone'
import { SectionHeader } from '../../ui/SectionHeader'
function RecordEditor({ kind, item, close }: { kind: LibraryKind; item?: LibraryRecord; close: () => void }) {
  const config = libraryCatalog[kind]
  const { dispatch } = useClone()
  const [name, setName] = useState(item?.name || '')
  const [fields, setFields] = useState<Record<string, string>>(item?.fields || Object.fromEntries(config.fields.map(f => [f.key, f.options?.[0] || ''])))
  const [notice, setNotice] = useState('')
  return <form className="glass-panel editor-form" onSubmit={e => {
    e.preventDefault(); const error = recordError(kind, name, fields); if (error) { setNotice(error); return }
    const saved = dispatch({ type: 'record', id: item?.id || crypto.randomUUID(), kind, name, fields, at: new Date().toISOString() }); if (saved) close()
  }}><h3>{item ? 'Editar' : 'Cadastrar'} · {config.label}</h3>
    <label>Nome<input required maxLength={160} value={name} onChange={e => setName(e.target.value)} /></label>
    <div className="editor-fields">{config.fields.map(field => <label key={field.key}>{field.label}
      {field.options ? <select value={fields[field.key] || ''} onChange={e => setFields({ ...fields, [field.key]: e.target.value })}>{field.options.map(option => <option key={option}>{option}</option>)}</select> : <textarea rows={3} maxLength={12000} required={field.required} value={fields[field.key] || ''} onChange={e => setFields({ ...fields, [field.key]: e.target.value })} />}
    </label>)}</div>
    <p className="editorial-muted">As referências permanecem neste navegador. Não inclua senhas, tokens ou URLs com credenciais.</p>
    <p role="alert">{notice}</p><div className="editorial-actions"><button type="submit" className="primary-button">Salvar registro</button><button type="button" onClick={close}>Cancelar</button></div>
  </form>
}
export function LibraryPanel({ kind }: { kind: LibraryKind }) {
  const { state } = useClone()
  const [editing, setEditing] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const config = libraryCatalog[kind]
  const records = state.records.filter(r => r.kind === kind && r.name.toLocaleLowerCase().includes(query.toLocaleLowerCase()))
  if (editing !== null) return <RecordEditor key={editing} kind={kind} item={state.records.find(r => r.id === editing)} close={() => setEditing(null)} />
  return <section className="page-stack"><div className="glass-panel"><SectionHeader title={config.label} eyebrow="Catálogo local" action={<button onClick={() => setEditing('new')}>Cadastrar</button>} /><p>{config.description}</p><label>Buscar por nome<input type="search" value={query} onChange={e => setQuery(e.target.value)} /></label></div>
    {records.length === 0 && <p>Nenhum registro encontrado. Cadastre informações reais para começar.</p>}
    <div className="prompt-grid">{records.map(record => <article className="prompt-card" key={record.id}><div className="editorial-row"><h3>{record.name}</h3><span>v{record.revision}</span></div>
      <dl>{config.fields.map(field => <div key={field.key}><dt>{field.label}</dt><dd>{record.fields[field.key] || 'Não informado'}</dd></div>)}</dl>
      <small>Atualizado em {new Date(record.updatedAt).toLocaleString('pt-BR')}</small><button onClick={() => setEditing(record.id)}>Editar</button>
    </article>)}</div>
  </section>
}
