import { Activity, ArrowRight, Bot, CheckCircle2, CircleDollarSign, Clock3, Target } from 'lucide-react'
import { founderEconomy, metrics, missions } from '../../data/mock'
import { useFounderAgents } from '../../core/useFounderAgents'
import { ProgressBar } from '../../ui/ProgressBar'
import { SectionHeader } from '../../ui/SectionHeader'
import { StatCard } from '../../ui/StatCard'
import { ApprovalQueue } from '../../engines/instagram/ApprovalQueue'

export function DashboardPage() {
  const agents = useFounderAgents()
  const activeMissions = missions.filter((mission) => mission.status !== 'Concluída').slice(0, 4)

  return (
    <div className="page-stack">
      <section className="metric-grid" aria-label="Indicadores da Kairos Digital">
        {metrics.map((metric) => <StatCard key={metric.id} metric={metric} />)}
      </section>

      <ApprovalQueue />
      <section className="dashboard-grid">
        <article className="glass-panel mission-panel">
          <SectionHeader eyebrow="Prioridades" title="Missões em curso" action={<button className="text-button">Ver todas <ArrowRight size={14} /></button>} />
          <div className="mission-list compact">
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
          <SectionHeader eyebrow="Operação" title="Agentes ativos" action={<span className="live-label"><i /> AO VIVO</span>} />
          <div className="agent-list">
            {agents.map((agent) => (
              <div className="agent-row" key={agent.id}>
                <span className="agent-glyph" style={{ '--agent-color': agent.color } as React.CSSProperties}><Bot size={17} /></span>
                <div className="agent-copy"><strong>{agent.name}</strong><span>{agent.task}</span><ProgressBar value={agent.progress} color={agent.color} /></div>
                <b>{agent.progress}%</b>
              </div>
            ))}
          </div>
        </article>

        <article className="glass-panel revenue-panel">
          <SectionHeader eyebrow="Últimos 7 dias" title="Pulso de receita" action={<Activity size={18} />} />
          <div className="chart-wrap" aria-label="Receita diária simulada">
            {[38, 52, 46, 68, 61, 84, 72].map((height, index) => (
              <div className="bar-column" key={index}><span style={{ height: `${height}%` }} /><small>{['S', 'T', 'Q', 'Q', 'S', 'S', 'D'][index]}</small></div>
            ))}
          </div>
          <div className="revenue-footer"><span><CircleDollarSign size={15} /> Melhor dia: sábado</span><strong>R$ 3.240</strong></div>
        </article>

        <article className="glass-panel founder-panel">
          <SectionHeader eyebrow="Founder progression" title={`Nível ${founderEconomy.level}`} action={<Target size={18} />} />
          <div className="xp-score"><strong>{founderEconomy.xp.toLocaleString('pt-BR')}</strong><span>/ {founderEconomy.nextLevelXp.toLocaleString('pt-BR')} XP</span></div>
          <ProgressBar value={(founderEconomy.xp / founderEconomy.nextLevelXp) * 100} />
          <div className="coin-balance"><span className="coin-icon">K</span><div><span>Saldo disponível</span><strong>{founderEconomy.balance} Kairos Coins</strong></div></div>
          <div className="economy-history">
            {founderEconomy.history.map((item) => <div key={item.id}><CheckCircle2 size={14} /><span>{item.label}</span><b>+{item.amount} KC</b></div>)}
          </div>
        </article>
      </section>

      <footer className="system-strip"><span><Clock3 size={14} /> Última sincronização: agora</span><span><i /> Mock mode</span><span>Kairos Core v0.1</span></footer>
    </div>
  )
}
