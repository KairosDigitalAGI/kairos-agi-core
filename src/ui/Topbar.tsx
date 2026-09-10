import { Bell, ChevronDown, Command, Sparkles } from 'lucide-react'

interface TopbarProps { title: string }

export function Topbar({ title }: TopbarProps) {
  return (
    <header className="topbar">
      <div>
        <p className="breadcrumb">Founder Edition <span>/</span> {title}</p>
        <h1>{title}</h1>
      </div>
      <div className="topbar-actions">
        <div className="live-pill"><span /> Sistema operacional</div>
        <button className="command-button" aria-label="Abrir busca global"><Command size={15} /> <kbd>⌘ K</kbd></button>
        <button className="icon-button" aria-label="Notificações"><Bell size={18} /><i /></button>
        <button className="founder-menu"><span className="founder-avatar"><Sparkles size={15} /></span><span>Founder</span><ChevronDown size={15} /></button>
      </div>
    </header>
  )
}
