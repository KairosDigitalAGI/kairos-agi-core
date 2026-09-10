import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import type { Metric } from '../types'

export function StatCard({ metric }: { metric: Metric }) {
  const Icon = metric.tone === 'active' ? ArrowUpRight : metric.tone === 'attention' ? ArrowDownRight : Minus
  return (
    <article className={`stat-card tone-${metric.tone}`}>
      <div className="stat-heading"><span>{metric.label}</span><Icon size={16} /></div>
      <strong>{metric.value}</strong>
      <p>{metric.delta}</p>
    </article>
  )
}
