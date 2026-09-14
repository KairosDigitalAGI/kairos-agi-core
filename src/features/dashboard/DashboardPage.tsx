import { Activity, Bot, Clock3, Target } from 'lucide-react'
import { metrics, missions } from '../../data/operational'
import { useFounderAgents } from '../../core/useFounderAgents'
import { useBusinessMetrics } from '../../core/useBusinessMetrics'
import { useFleetStatus } from '../../core/useFleetStatus'
import { ProductionProgress } from './ProductionProgress'
import type { Metric, ModuleKey } from '../../types'
import { EmptyState } from '../../ui/EmptyState'
import { SectionHeader } from '../../ui/SectionHeader'
import { StatCard } from '../../ui/StatCard'
import { CloneApprovalQueue } from '../../engines/clone/CloneApprovalQueue'
import { ApprovalQueue } from '../../engines/instagram/ApprovalQueue'
import { OperationsUnlock } from './OperationsUnlock'
import { FleetPanel } from './FleetPanel'

const brl = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

// Substitui os placeholders '—' pelos números reais do schema `command`
// quando o Painel Operacional está desbloqueado e a rota respondeu 'real'.
// Sem credencial, erro ou 'unavailable': mantém o placeholder, nunca inventa.
function withRealBusinessMetrics(base: Metric[], businessMetrics: ReturnType<typeof useBusinessMetrics>['state']): Metric[] {
  if (businessMetrics.status !== 'ok' || businessMetrics.data.source !== 'real') return base
  const { receitaTotal, receitaMes, clientesAtivos } = businessMetrics.data
  const overrides: Record<string, Partial<Metric>> = {
    'total-revenue': receitaTotal !== undefined ? { value: brl(receitaTotal), delta: 'Supabase command.receitas', tone: 'active' } : {},
    'monthly-revenue': receitaMes !== undefined ? { value: brl(receitaMes), delta: 'Mês corrente · command.receitas', tone: 'active' } : {},
    'active-clients': clientesAtivos !== undefined ? { value: String(clientesAtivos), delta: 'Supabase command.clientes', tone: 'active' } : {},
  }
  return base.map((metric) => ({ ...metric, ...overrides[metric.id] }))
}

export function DashboardPage({ navigate }: { navigate: (module: ModuleKey) => void }) {
  const agents = useFounderAgents()
  const activeMissions = missions.filter((mission) => mission.status !== 'Concluída').slice(0, 4)
  const { state: businessMetrics } = useBusinessMetrics()
  const { state: fleetStatus } = useFleetStatus()
  const liveMetrics = withRealBusinessMetrics(metrics, businessMetrics)

  return (
    <div className="page-stack"><ProductionProgress navigate={navigate} />
      <OperationsUnlock />
      <section className="metric-grid" aria-label="Indicadores da Kairos Digital">
        {liveMetrics.map((metric) => <StatCard key={metric.id} metric={metric} />)}
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
          <SectionHeader eyebrow="Operação" title={`${agents.length} agentes configurados`} action={<button onClick={() => navigate('agents')}>Ver organograma completo</button>} />
          <div className="agent-list">
            {agents.slice(0, 6).map((agent) => (
              <div className="agent-row" key={agent.id}>
                <span className="agent-glyph" style={{ '--agent-color': agent.color } as React.CSSProperties}><Bot size={17} /></span>
                <div className="agent-copy"><strong>{agent.name}</strong><span>{agent.task}</span></div>
                <b>{agent.status}</b>
              </div>
            ))}
          </div>
        </article>

        <article className="glass-panel revenue-panel">
          <SectionHeader eyebrow="Mês corrente" title="Pulso de receita" action={<Activity size={18} />} />
          {businessMetrics.status === 'sem-credencial' && <p>Trancado. Desbloqueie o Painel Operacional acima para ver a receita real.</p>}
          {businessMetrics.status === 'carregando' && <p>Consultando receita…</p>}
          {businessMetrics.status === 'erro' && <p>{businessMetrics.mensagem}</p>}
          {businessMetrics.status === 'ok' && businessMetrics.data.source === 'unavailable' && (
            <p>Receita indisponível: {businessMetrics.data.reason ?? 'schema command não configurado.'}</p>
          )}
          {businessMetrics.status === 'ok' && businessMetrics.data.source === 'real' && (
            <ul className="revenue-breakdown">
              <li><span>Receita do mês</span><b>{businessMetrics.data.receitaMes !== undefined ? brl(businessMetrics.data.receitaMes) : '—'}</b></li>
              <li><span>MRR</span><b>{businessMetrics.data.mrr !== undefined ? brl(businessMetrics.data.mrr) : '—'}</b></li>
              <li><span>Receita total</span><b>{businessMetrics.data.receitaTotal !== undefined ? brl(businessMetrics.data.receitaTotal) : '—'}</b></li>
              <li><span>Clientes ativos</span><b>{businessMetrics.data.clientesAtivos ?? '—'} / {businessMetrics.data.clientesTotal ?? '—'}</b></li>
            </ul>
          )}
        </article>

        <article className="glass-panel founder-panel">
          <SectionHeader eyebrow="Founder" title="Kairos Coins e XP" action={<Target size={18} />} />
          <p>Saldo e nível indisponíveis. Nenhum registro de recompensa verificado foi conectado.</p>
        </article>

        <FleetPanel state={fleetStatus} />
      </section>

      <footer className="system-strip"><span><Clock3 size={14} /> Sem sincronização externa</span><span>Sem dados demonstrativos</span><span>Kairos Core v0.1</span></footer>
    </div>
  )
}
