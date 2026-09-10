import { CalendarDays, Camera, Eye, Heart, MessageCircle, Play, TrendingUp } from 'lucide-react'
import { ProgressBar } from '../../ui/ProgressBar'
import { SectionHeader } from '../../ui/SectionHeader'

const calendar = [
  { day: 'SEG', type: 'Reel', title: 'O futuro já começou', status: 'Aprovado' },
  { day: 'TER', type: 'Story', title: 'Bastidores da Kairos', status: 'Pronto' },
  { day: 'QUA', type: 'Carrossel', title: '5 agentes, uma empresa', status: 'Revisão' },
  { day: 'QUI', type: 'Reel', title: 'Founder Tower', status: 'Produção' },
]

export function InstagramPage() {
  return (
    <div className="page-stack">
      <section className="instagram-hero">
        <div className="instagram-orb"><Camera size={30} /></div>
        <div><span className="eyebrow">Instagram Engine</span><h2>@kairosdigital</h2><p>Produção editorial simulada · nenhuma API conectada</p></div>
        <div className="ig-kpis"><span><strong>18,4k</strong> alcance</span><span><strong>6,8%</strong> engajamento</span><span><strong>+428</strong> seguidores</span></div>
      </section>
      <section className="instagram-grid">
        <article className="glass-panel content-production">
          <SectionHeader eyebrow="Meta mensal" title="Produção de conteúdo" action={<span className="status-chip working">Em execução</span>} />
          <div className="production-score"><strong>07</strong><span>/ 30 Reels</span></div><ProgressBar value={23} color="#f472b6" />
          <div className="production-stats"><span><Play size={15} /> 4 roteiros prontos</span><span><Eye size={15} /> 2 em revisão</span><span><CalendarDays size={15} /> 19 planejados</span></div>
        </article>
        <article className="glass-panel engagement-card">
          <SectionHeader eyebrow="Sinal" title="Engajamento" action={<TrendingUp size={18} />} />
          <div className="engagement-number">+24,8%</div><p>Comparado ao período anterior</p>
          <div className="engagement-split"><span><Heart size={15} /> 4.821 interações</span><span><MessageCircle size={15} /> 312 conversas</span></div>
        </article>
      </section>
      <section className="glass-panel calendar-panel">
        <SectionHeader eyebrow="Esta semana" title="Calendário editorial" />
        <div className="calendar-list">{calendar.map((item) => <article key={item.day}><b>{item.day}</b><div><small>{item.type}</small><strong>{item.title}</strong></div><span className={`status-chip ${item.status === 'Produção' ? 'working' : ''}`}>{item.status}</span></article>)}</div>
      </section>
    </div>
  )
}
