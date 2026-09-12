import {
  BarChart3, Bot, Camera, CircleDollarSign, Clapperboard, Contact, Database,
  Globe2, LayoutDashboard, ListChecks, PlugZap, Search, Settings, Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ModuleKey } from '../types'

interface SidebarProps {
  active: ModuleKey
  onNavigate: (module: ModuleKey) => void
}

const navigation: Array<{ id: ModuleKey; label: string; icon: LucideIcon }> = [
  { id: 'agents', label: 'Agentes', icon: Bot },
  { id: 'world', label: 'World', icon: Globe2 },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'missions', label: 'Missões', icon: ListChecks },
  { id: 'clients', label: 'Clientes', icon: Users },
  { id: 'crm', label: 'CRM', icon: Contact },
  { id: 'instagram', label: 'Instagram', icon: Camera },
  { id: 'clone', label: 'Clone Engine', icon: Bot },
  { id: 'video', label: 'Video Engine', icon: Clapperboard },
  { id: 'hunter', label: 'Hunter', icon: Search },
  { id: 'money-lab', label: 'Money Lab', icon: CircleDollarSign },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'integrations', label: 'Integrações', icon: PlugZap },
  { id: 'vault', label: 'Vault', icon: Database },
  { id: 'settings', label: 'Configurações', icon: Settings },
]

export function Sidebar({ active, onNavigate }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark"><Bot size={21} /></div>
        <div><strong>KAIROS</strong><span>FOUNDER OS</span></div>
      </div>

      <nav className="nav-list" aria-label="Navegação principal">
        {navigation.map(({ id, label, icon: Icon }) => (
          <button
            className={`nav-item ${active === id ? 'active' : ''}`}
            key={id}
            onClick={() => onNavigate(id)}
            aria-current={active === id ? 'page' : undefined}
          >
            <Icon size={18} strokeWidth={1.8} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="economy-mini"><div className="economy-copy"><span>Kairos Coins</span><strong>Saldo indisponível</strong></div></div>
    </aside>
  )
}
