import type { LucideIcon } from 'lucide-react'
import { LockKeyhole, Radio, Sparkles } from 'lucide-react'

interface ModulePlaceholderProps { title: string; description: string; icon: LucideIcon; vault?: boolean }

export function ModulePlaceholder({ title, description, icon: Icon, vault }: ModulePlaceholderProps) {
  return (
    <section className="placeholder-page glass-panel">
      <div className="placeholder-icon"><Icon size={34} /></div><span className="eyebrow">Kairos Core v0.1</span><h2>{title}</h2><p>{description}</p>
      <div className="placeholder-status"><Radio size={15} /><span>{vault ? 'Placeholder seguro — nenhum segredo armazenado' : 'Módulo preparado para evolução'}</span></div>
      <div className="placeholder-grid"><div><Sparkles size={17} /><strong>Contratos compartilhados</strong><span>Sem lógica duplicada</span></div><div><LockKeyhole size={17} /><strong>Fonte não conectada</strong><span>Sem integrações externas</span></div></div>
    </section>
  )
}
