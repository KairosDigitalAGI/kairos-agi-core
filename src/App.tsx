import { lazy, Suspense, useMemo, useState } from 'react'
import { BarChart3, CircleDollarSign, Database, Search, Settings, Users } from 'lucide-react'
import type { ModuleKey } from './types'
import { Sidebar } from './ui/Sidebar'
import { Topbar } from './ui/Topbar'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { MissionsPage } from './features/tasks/MissionsPage'
import { CrmPage } from './features/crm/CrmPage'
import { InstagramPage } from './engines/instagram/InstagramPage'
import { ModulePlaceholder } from './features/shared/ModulePlaceholder'

const WorldPage = lazy(() => import('./world/WorldPage').then((module) => ({ default: module.WorldPage })))

const titles: Record<ModuleKey, string> = {
  world: 'Kairos World', dashboard: 'Visão geral', missions: 'Missões', clients: 'Clientes', crm: 'CRM',
  instagram: 'Instagram', hunter: 'Hunter', 'money-lab': 'Money Lab', analytics: 'Analytics', vault: 'Vault', settings: 'Configurações',
}

export function App() {
  const [active, setActive] = useState<ModuleKey>('dashboard')
  const content = useMemo(() => {
    switch (active) {
      case 'dashboard': return <DashboardPage />
      case 'world': return <Suspense fallback={<div className="world-loading">Abrindo Founder Tower…</div>}><WorldPage /></Suspense>
      case 'missions': return <MissionsPage />
      case 'crm': return <CrmPage />
      case 'instagram': return <InstagramPage />
      case 'clients': return <ModulePlaceholder title="Clientes" description="Visão consolidada dos clientes e das Engines contratadas." icon={Users} />
      case 'hunter': return <ModulePlaceholder title="Hunter" description="Descoberta, qualificação e encaminhamento de oportunidades para o CRM." icon={Search} />
      case 'money-lab': return <ModulePlaceholder title="Money Lab" description="Pesquisa de oportunidades de receita com aprovação obrigatória do Founder." icon={CircleDollarSign} />
      case 'analytics': return <ModulePlaceholder title="Analytics" description="Indicadores de receita, operação, audiência e desempenho dos agentes." icon={BarChart3} />
      case 'vault': return <ModulePlaceholder title="Vault" description="Centro futuro de identidades e referências seguras para credenciais." icon={Database} vault />
      case 'settings': return <ModulePlaceholder title="Configurações" description="Preferências da Founder Edition, limites e políticas operacionais." icon={Settings} />
    }
  }, [active])

  return (
    <div className="app-shell">
      <Sidebar active={active} onNavigate={setActive} />
      <div className="workspace">
        <Topbar title={titles[active]} />
        <main className={`page-content ${active === 'world' ? 'world-content' : ''}`}>{content}</main>
      </div>
    </div>
  )
}
