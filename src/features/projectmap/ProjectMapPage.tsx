import { useMemo, useState, type FormEvent } from 'react'
import { Bug, CheckCircle2, Lightbulb, ListTodo, Map, Plus } from 'lucide-react'
import { useOperationsAuth } from '../../core/OperationsAuthProvider'
import { useProjectLog } from '../../core/useProjectLog'
import { OperationsUnlock } from '../dashboard/OperationsUnlock'
import type { ProjectLogAgent, ProjectLogEntry, ProjectLogType } from '../../types/operations'
import './projectmap.css'

const typeMeta: Record<ProjectLogType, { label: string; icon: typeof CheckCircle2 }> = {
  done: { label: 'Feito', icon: CheckCircle2 },
  todo: { label: 'Pendente', icon: ListTodo },
  idea: { label: 'Ideia', icon: Lightbulb },
  bug: { label: 'Bug', icon: Bug },
}

const filters: Array<{ id: ProjectLogType | 'todos'; label: string }> = [
  { id: 'todos', label: 'Todos' },
  { id: 'done', label: 'Feito' },
  { id: 'todo', label: 'Pendente' },
  { id: 'idea', label: 'Ideia' },
  { id: 'bug', label: 'Bug' },
]

const emptyForm = { agent: 'founder' as ProjectLogAgent, phase: '', type: 'todo' as ProjectLogType, title: '', description: '', commit: '', deployed: false }

// Mapa do Projeto (Missão 006, Fase 14) — diário de bordo persistente do
// próprio desenvolvimento do kairos-agi-core (command.project_log), lido por
// qualquer visitante do dashboard e escrito por qualquer agente (Claude
// Code, Codex) ou pelo Founder ao fim de cada sessão (ver AGENTS.md na raiz
// do repo). Leitura pública de propósito; só o formulário de nova entrada
// exige o Painel Operacional desbloqueado.
export function ProjectMapPage() {
  const { header } = useOperationsAuth()
  const { state, addEntry, submitting, submitError } = useProjectLog()
  const [filter, setFilter] = useState<ProjectLogType | 'todos'>('todos')
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const entries: ProjectLogEntry[] = state.status === 'ok' && state.data.source === 'real' ? state.data.entries : []
  const visible = filter === 'todos' ? entries : entries.filter((entry) => entry.type === filter)
  const counts = useMemo(() => {
    const base: Record<ProjectLogType, number> = { done: 0, todo: 0, idea: 0, bug: 0 }
    for (const entry of entries) base[entry.type] += 1
    return base
  }, [entries])
  const progressoPct = entries.length ? Math.round((counts.done / entries.length) * 100) : 0

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return
    const ok = await addEntry(form)
    if (ok) { setForm(emptyForm); setFormOpen(false) }
  }

  return (
    <section className="page-stack project-map-page">
      <header className="glass-panel project-map-hero">
        <div>
          <span className="eyebrow"><Map size={14} /> HISTÓRICO VIVO</span>
          <h2>Mapa do Projeto</h2>
          <p>Tudo que já foi feito, o que falta e as ideias novas — registrado por qualquer agente ao fim de cada sessão. Nunca perde histórico.</p>
        </div>
        <div className="project-map-progress">
          <strong>{progressoPct}%</strong>
          <span>{counts.done} feito · {counts.todo} pendente · {counts.idea} ideia · {counts.bug} bug</span>
        </div>
      </header>

      <OperationsUnlock />

      {state.status === 'carregando' && <p className="project-map-alert">Consultando o Mapa…</p>}
      {state.status === 'erro' && <p className="project-map-alert" role="alert">{state.mensagem}</p>}
      {state.status === 'ok' && state.data.source === 'unavailable' && (
        <p className="project-map-alert">Mapa indisponível: {state.data.reason ?? 'schema command não configurado.'}</p>
      )}

      <div className="project-map-toolbar">
        <div className="project-map-filters" role="tablist" aria-label="Filtrar por tipo">
          {filters.map(({ id, label }) => (
            <button key={id} type="button" role="tab" aria-selected={filter === id} className={filter === id ? 'active' : ''} onClick={() => setFilter(id)}>
              {label}
            </button>
          ))}
        </div>
        {header && (
          <button type="button" className="project-map-add" onClick={() => setFormOpen((v) => !v)}>
            <Plus size={15} /> Adicionar entrada
          </button>
        )}
        {!header && <small>Desbloqueie o Painel Operacional acima para adicionar uma entrada.</small>}
      </div>

      {formOpen && header && (
        <form className="glass-panel project-map-form" onSubmit={onSubmit}>
          <div className="project-map-form-row">
            <label>Agente<select value={form.agent} onChange={(e) => setForm({ ...form, agent: e.target.value as ProjectLogAgent })}>
              <option value="founder">founder</option>
              <option value="claude-code">claude-code</option>
              <option value="codex">codex</option>
            </select></label>
            <label>Tipo<select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as ProjectLogType })}>
              <option value="done">done</option>
              <option value="todo">todo</option>
              <option value="idea">idea</option>
              <option value="bug">bug</option>
            </select></label>
            <label>Fase<input value={form.phase} onChange={(e) => setForm({ ...form, phase: e.target.value })} placeholder="ex.: Fase 14" /></label>
          </div>
          <label className="project-map-form-full">Título<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="Título curto da entrada" /></label>
          <label className="project-map-form-full">Descrição<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Detalhes (opcional)" /></label>
          <div className="project-map-form-row">
            <label>Commit<input value={form.commit} onChange={(e) => setForm({ ...form, commit: e.target.value })} placeholder="ex.: c54a230" /></label>
            <label className="project-map-form-checkbox"><input type="checkbox" checked={form.deployed} onChange={(e) => setForm({ ...form, deployed: e.target.checked })} /> Em produção</label>
          </div>
          {submitError && <small role="alert">{submitError}</small>}
          <button type="submit" disabled={submitting || !form.title.trim()}>{submitting ? 'Registrando…' : 'Registrar no Mapa'}</button>
        </form>
      )}

      <div className="project-map-grid">
        {visible.map((entry) => {
          const meta = typeMeta[entry.type]
          const Icon = meta.icon
          return (
            <article className="glass-panel project-map-card" key={entry.id}>
              <div className="project-map-card-head">
                <span className={`project-map-type ${entry.type}`}><Icon size={13} /> {meta.label}</span>
                {entry.phase && <span className="project-map-phase">{entry.phase}</span>}
              </div>
              <h3>{entry.title}</h3>
              {entry.description && <p>{entry.description}</p>}
              <div className="project-map-card-foot">
                <span>{new Date(entry.created_at).toLocaleString('pt-BR')}</span>
                <span>{entry.agent}</span>
                {entry.commit && <code>{entry.commit}</code>}
                {entry.deployed && <span className="project-map-deployed">em produção</span>}
              </div>
            </article>
          )
        })}
        {state.status === 'ok' && state.data.source === 'real' && visible.length === 0 && (
          <p className="project-map-alert">Nenhuma entrada para este filtro ainda.</p>
        )}
      </div>
    </section>
  )
}
