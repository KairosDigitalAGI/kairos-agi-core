import type { Department } from './departments'
import { Bot, Building2, Maximize2, Radio, X } from 'lucide-react'
import { useState } from 'react'
import { useFounderAgents } from '../core/useFounderAgents'
import type { FounderAgent } from '../types'
import { ProgressBar } from '../ui/ProgressBar'
import { FounderTower } from './FounderTower'

export function WorldPage({ department }: { department: Department }) {
  const agents = useFounderAgents()
  const [selectedId, setSelectedId] = useState<FounderAgent['id']>('orion')
  const selected = agents.find(agent => agent.id === selectedId) || agents[0]
  const setSelected = (agent: FounderAgent) => setSelectedId(agent.id)
  const openFullscreen = () => {
    const world = document.querySelector('.world-shell')
    if (world instanceof HTMLElement && document.fullscreenElement === null) void world.requestFullscreen()
  }
  return (
    <section className="world-shell">
      <div className="world-toolbar">
        <div><span className="eyebrow"><Radio size={13} /> WORLD 0.1 · EXECUTORES DESCONECTADOS</span><h2>{department.name}</h2></div>
        <div><span><Building2 size={15} /> {department.area}</span><button aria-label="Abrir World em tela cheia" onClick={openFullscreen}><Maximize2 size={16} /></button></div>
      </div>
      <FounderTower department={department} agents={agents} selected={selected} onSelect={setSelected} />
      <aside className="agent-inspector" aria-label={`Detalhes de ${selected.name}`}>
        <div className="inspector-top"><span className="agent-glyph large" style={{ '--agent-color': selected.color } as React.CSSProperties}><Bot size={22} /></span><button aria-label="Fechar painel" onClick={() => setSelected(agents[0])}><X size={17} /></button></div>
        <span className="eyebrow">{selected.role}</span><h3>{selected.name}</h3><span className="working-state">{selected.status}</span>
        <div className="inspector-task"><small>Tarefa atual</small><strong>{selected.task}</strong><ProgressBar value={selected.progress} color={selected.color} /><div><span>Execução automática</span><b>Desconectada</b></div></div>
      </aside>
      <div className="world-roster" aria-label="Selecionar agente">
        {agents.map((agent) => <button key={agent.id} className={selected.id === agent.id ? 'active' : ''} onClick={() => setSelected(agent)}><i style={{ background: agent.color }} />{agent.name}</button>)}
      </div>
    </section>
  )
}
