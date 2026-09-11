import { Sparkles } from 'lucide-react'
export function Topbar({ title }: { title: string }) {
  return <header className="topbar"><div><p className="breadcrumb">Founder Edition <span>/</span> {title}</p><h1>{title}</h1></div><div className="topbar-actions"><span className="live-pill">Integrações pendentes</span><span className="founder-menu"><span className="founder-avatar"><Sparkles size={15} /></span><span>Founder</span></span></div></header>
}
