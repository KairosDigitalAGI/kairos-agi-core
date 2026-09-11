import { Check, ChevronRight, Coins, Flag, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { missions as initialMissions } from '../../data/operational'
import type { Mission } from '../../types'
import { SectionHeader } from '../../ui/SectionHeader'

const columns: Array<{ status: Mission['status']; label: string }> = [
  { status: 'Pendente', label: 'Fila' },
  { status: 'Em andamento', label: 'Em execução' },
  { status: 'Concluída', label: 'Concluídas' },
]

export function MissionsPage() {
  const [missions, setMissions] = useState(initialMissions)
  const advanceMission = (id: string) => {
    setMissions((current) => current.map((mission) => {
      if (mission.id !== id) return mission
      const status: Mission['status'] = mission.status === 'Pendente' ? 'Em andamento' : 'Concluída'
      return { ...mission, status }
    }))
  }
  const openCount = missions.filter((mission) => mission.status !== 'Concluída').length
  const availableXp = missions.filter((mission) => mission.status !== 'Concluída').reduce((total, mission) => total + mission.xp, 0)

  return (
    <div className="page-stack">
      <section className="missions-hero glass-panel">
        <div><span className="eyebrow">Task System</span><h2>Transforme trabalho em progresso visível.</h2><p>Aguardando conexão com as missões reais. Recompensas não estão ativas.</p></div>
        <div className="mission-summary"><strong>{openCount}</strong><span>abertas</span><i /><strong>{availableXp}</strong><span>XP disponível</span></div>
      </section>
      <section className="kanban" aria-label="Quadro de missões">
        {columns.map((column) => (
          <div className="kanban-column" key={column.status}>
            <SectionHeader eyebrow={column.status} title={column.label} action={<span className="count-badge">{missions.filter((m) => m.status === column.status).length}</span>} />
            <div className="task-stack">
              {missions.filter((mission) => mission.status === column.status).map((mission) => (
                <article className="task-card" key={mission.id}>
                  <div className="task-card-top"><span className={`priority-label ${mission.priority.toLowerCase()}`}><Flag size={12} />{mission.priority}</span><small>{mission.id}</small></div>
                  <h3>{mission.title}</h3><p>{mission.category} · {mission.owner}</p>
                  <div className="task-rewards"><span><Sparkles size={14} />{mission.xp} XP</span><span><Coins size={14} />{mission.coins} KC</span>{mission.status === 'Concluída' ? <Check size={15} /> : <button className="task-advance" onClick={() => advanceMission(mission.id)}>{mission.status === 'Pendente' ? 'Iniciar' : 'Concluir'} <ChevronRight size={13} /></button>}</div>
                </article>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
