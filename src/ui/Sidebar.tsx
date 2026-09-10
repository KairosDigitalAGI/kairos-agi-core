import {
  BarChart3, Bot, Camera, CircleDollarSign, Contact, Database, Gauge,
  Globe2, LayoutDashboard, ListChecks, Search, Settings, Users,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ModuleKey } from '../types'
import { founderEconomy } from '../data/mock'

interface SidebarProps {
  active: ModuleKey
  onNavigate: (module: ModuleKey) => void
}

const navigation: Array<{ id: ModuleKey; label: string; icon: LucideIcon }> = [
  { id: 'world', label: 'World', icon: Globe2 },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'missions', label: 'Missões', icon: ListChecks },
  { id: 'clients', label: 'Clientes', icon: Users },
  { id: 'crm', label: 'CRM', icon: Contact },
  { id: 'instagram', label: 'Instagram', icon: Camera },
  { id: 'hunter', label: 'Hunter', icon: Search },
  { id: 'money-lab', label: 'Money Lab', icon: CircleDollarSign },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
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
            {id === 'missions' && <span className="nav-badge">5</span>}
          </button>
        ))}
      </nav>

      <div className="economy-mini">
        <div className="level-ring"><Gauge size={17} /><strong>{founderEconomy.level}</strong></div>
        <div className="economy-copy">
          <span>Nível {founderEconomy.level}</span>
          <strong>{founderEconomy.balance} KC</strong>
        </div>
        <div className="mini-progress"><i style={{ width: `${(founderEconomy.xp / founderEconomy.nextLevelXp) * 100}%` }} /></div>
      </div>
    </aside>
  )
}
