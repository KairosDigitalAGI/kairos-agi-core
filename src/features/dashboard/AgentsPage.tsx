import { useState } from 'react'
import registry from '../../data/agentRegistry.json'
import meetings from '../../data/meetingTemplates.json'
import { useFounderAgents } from '../../core/useFounderAgents'
import type { ModuleKey } from '../../types'
import './agents.css'
export function AgentsPage({ navigate }: { navigate: (module: ModuleKey) => void }) {
  const [query, setQuery] = useState('')
  const [department, setDepartment] = useState('Todos')
  const agents = useFounderAgents()
  const visible = registry.filter(a => (department === 'Todos' || a.department === department) && `${a.name} ${a.role} ${a.responsibility}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()))
  const nameOf = (id: string) => registry.find(a => a.id === id)?.name || id
  return <div className="page-stack editorial"><section className="glass-panel"><span className="eyebrow">ORGANOGRAMA DA KAIROS</span><h2>Uma empresa. Departamentos especializados.</h2><p>{registry.length} papéis configurados: {registry.filter(a => a.source === 'Kairos OS').length} do Kairos OS e {registry.filter(a => a.source !== 'Kairos OS').length} do Blueprint e adendos.</p><p>Founder → ORION → departamentos. Executores ainda não conectados a este Core; métricas abaixo são objetivos de acompanhamento, não resultados obtidos.</p></section>
    <div className="editorial-filters"><label>Buscar agente<input value={query} onChange={e => setQuery(e.target.value)} type="search" /></label><label>Departamento<select value={department} onChange={e => setDepartment(e.target.value)}>{['Todos', ...new Set(registry.map(a => a.department))].map(d => <option key={d}>{d}</option>)}</select></label></div>
    <section className="agent-directory">{visible.map(agent => <article className="glass-panel" key={agent.id} style={{ borderTopColor: agent.color }}><span className="eyebrow">{agent.department}</span><h3>{agent.name}</h3><p>{agent.responsibility}</p><dl><dt>Responde a</dt><dd>{nameOf(agent.reportsTo)}</dd><dt>Indicador a acompanhar</dt><dd>{agent.kpi}</dd><dt>Neste Core</dt><dd>{agents.find(a => a.id === agent.id)?.task}</dd><dt>Origem</dt><dd>{agent.source}</dd><dt>Implementação na origem</dt><dd>{agent.evidence.length ? 'Código de motor/importador catalogado; conexão não verificada' : 'Papel definido; executor não comprovado'}</dd></dl><button onClick={() => navigate(agent.module as ModuleKey)}>Abrir painel relacionado</button><details><summary>Estrutura do departamento</summary><p>{registry.filter(a => a.reportsTo === agent.id).map(a => a.name).join(' · ') || 'Sem subordinados cadastrados.'}</p></details></article>)}</section>
    {!visible.length && <p>Nenhum agente encontrado.</p>}
    <section className="glass-panel"><h2>Reuniões do Kairos OS</h2><p>Modelos de agenda preservados. Não há reuniões agendadas, executadas ou automações ligadas.</p><div className="prompt-grid">{meetings.map(meeting => <article key={meeting.name} className="prompt-card"><h3>{meeting.name}</h3><p>Horário proposto na origem: {meeting.time}</p><p>{meeting.participants.map(nameOf).join(' · ')}</p><ul>{meeting.agenda.map(item => <li key={item}>{item}</li>)}</ul></article>)}</div></section>
  </div>
}
