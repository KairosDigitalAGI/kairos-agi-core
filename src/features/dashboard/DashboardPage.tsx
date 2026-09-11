import { Activity, Bot, Clock3, Target } from 'lucide-react'
import { metrics, missions } from '../../data/operational'
import { useFounderAgents } from '../../core/useFounderAgents'
import { ProductionProgress } from './ProductionProgress'
import type { ModuleKey } from '../../types'
import { EmptyState } from '../../ui/EmptyState'
import { SectionHeader } from '../../ui/SectionHeader'
import { StatCard } from '../../ui/StatCard'
import { CloneApprovalQueue } from '../../engines/clone/CloneApprovalQueue'
import { ApprovalQueue } from '../../engines/instagram/ApprovalQueue'

export function DashboardPage({ navigate }: { navigate: (module: ModuleKey) => void }) {
  const agents = useFounderAgents()
  const activeMissions = missions.filter((mission) => mission.status !== 'Concluída').slice(0, 4)

  return (
    <div className="page-stack"><ProductionProgress navigate={navigate} />
      <section className="metric-grid" aria-label="Indicadores da Kairos Digital">
        {metrics.map((metric) => <StatCard key={metric.id} metric={metric} />)}
      </section>

      <ApprovalQueue /><CloneApprovalQueue />
      <section className="dashboard-grid">
        <article className="glass-panel mission-panel">
          <SectionHeader eyebrow="Prioridades" title="Missões em curso" />
          <div className="mission-list compact"><EmptyState title="Missões aguardando conexão" text="Acompanhe a preparação real do Clone no painel acima." />
            {activeMissions.map((mission) => (
              <div className="mission-row" key={mission.id}>
                <span className={`priority-dot ${mission.priority.toLowerCase()}`} />
                <div className="mission-main"><strong>{mission.title}</strong><span>{mission.category} · {mission.owner}</span></div>
                <div className="reward"><b>+{mission.xp}</b><span>XP</span></div>
                <span className={`status-chip ${mission.status === 'Em andamento' ? 'working' : ''}`}>{mission.status}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="glass-panel agent-panel">
          <SectionHeader eyebrow="Operação" title="Agentes configurados" action={<span>Executores desconectados</span>} />
          <div className="agent-list">
            {agents.map((agent) => (
              <div className="agent-row" key={agent.id}>
                <span className="agent-glyph" style={{ '--agent-color': agent.color } as React.CSSProperties}><Bot size={17} /></span>
                <div className="agent-copy"><strong>{agent.name}</strong><span>{agent.task}</span></div>
                <b>{agent.status}</b>
              </div>
            ))}
          </div>
        </article>

        <article className="glass-panel revenue-panel">
          <SectionHeader eyebrow="Últimos 7 dias" title="Pulso de receita" action={<Activity size={18} />} />
          <p>Receita indisponível. Aguardando conexão com registros financeiros reais.</p>
        </article>

        <article className="glass-panel founder-panel">
          <SectionHeader eyebrow="Founder" title="Kairos Coins e XP" action={<Target size={18} />} />
          <p>Saldo e nível indisponíveis. Nenhum registro de recompensa verificado foi conectado.</p>
        </article>
      </section>

      <footer className="system-strip"><span><Clock3 size={14} /> Sem sincronização externa</span><span>Sem dados demonstrativos</span><span>Kairos Core v0.1</span></footer>
    </div>
  )
}
