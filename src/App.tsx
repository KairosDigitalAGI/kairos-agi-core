import { lazy, Suspense, useEffect, useState } from 'react'
import { BarChart3, CircleDollarSign, Database, Search, Settings, Users } from 'lucide-react'
import type { ModuleKey } from './types'
import { departments } from './world/departments'
import './world/immersive.css'
import { Sidebar } from './ui/Sidebar'
import { Topbar } from './ui/Topbar'
import { AgentsPage } from './features/dashboard/AgentsPage'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { MissionsPage } from './features/tasks/MissionsPage'
import { CrmPage } from './features/crm/CrmPage'
import { InstagramPage } from './engines/instagram/InstagramPage'
import { ClonePage } from './engines/clone/ClonePage'
import { VideoPage } from './engines/video/VideoPage'
import { ModulePlaceholder } from './features/shared/ModulePlaceholder'
import { IntegrationsPage } from './features/integrations/IntegrationsPage'

const DepartmentBackdrop = lazy(() => import('./world/DepartmentBackdrop').then(module => ({ default: module.DepartmentBackdrop })))
const WorldPage = lazy(() => import('./world/WorldPage').then((module) => ({ default: module.WorldPage })))

const titles: Record<ModuleKey, string> = {
  agents: 'Agentes e departamentos', world: 'Kairos World', dashboard: 'Visão geral', missions: 'Missões', clients: 'Clientes', crm: 'CRM',
  instagram: 'Instagram', clone: 'Clone Engine', video: 'Video Engine', hunter: 'Hunter', 'money-lab': 'Money Lab', analytics: 'Analytics', integrations: 'Integrações', vault: 'Vault', settings: 'Configurações',
}

export function App() {
  const [active, setActive] = useState<ModuleKey>('dashboard')
  const [worldModule, setWorldModule] = useState<ModuleKey>('dashboard')
  const [immersive, setImmersive] = useState(true)
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => { const media = window.matchMedia('(prefers-reduced-motion: reduce)'); const update = () => setReduced(media.matches); media.addEventListener('change', update); return () => media.removeEventListener('change', update) }, [])
  const department = departments[active === 'world' ? worldModule : active]
  const navigate = (module: ModuleKey) => { if (module === 'world' && active !== 'world') setWorldModule(active); setActive(module) }
  const content = (() => {
    switch (active) {
      case 'agents': return <AgentsPage navigate={navigate} />
      case 'dashboard': return <DashboardPage navigate={navigate} />
      case 'world': return <Suspense fallback={<div className="world-loading">Abrindo Founder Tower…</div>}><WorldPage department={department} /></Suspense>
      case 'missions': return <MissionsPage />
      case 'crm': return <CrmPage />
      case 'instagram': return <InstagramPage />
      case 'clone': return <ClonePage />
      case 'video': return <VideoPage />
      case 'clients': return <ModulePlaceholder title="Clientes" description="Visão consolidada dos clientes e das Engines contratadas." icon={Users} />
      case 'hunter': return <ModulePlaceholder title="Hunter" description="Descoberta, qualificação e encaminhamento de oportunidades para o CRM." icon={Search} />
      case 'money-lab': return <ModulePlaceholder title="Money Lab" description="Pesquisa de oportunidades de receita com aprovação obrigatória do Founder." icon={CircleDollarSign} />
      case 'analytics': return <ModulePlaceholder title="Analytics" description="Indicadores de receita, operação, audiência e desempenho dos agentes." icon={BarChart3} />
      case 'integrations': return <IntegrationsPage />
      case 'vault': return <ModulePlaceholder title="Vault" description="Centro futuro de identidades e referências seguras para credenciais." icon={Database} vault />
      case 'settings': return <ModulePlaceholder title="Configurações" description="Preferências da Founder Edition, limites e políticas operacionais." icon={Settings} />
    }
  })()

  return (
    <div className={`app-shell immersive-shell ${immersive ? 'immersive-on' : 'focus-mode'}`} style={{ '--department-color': department.color } as React.CSSProperties}>
      {immersive && active !== 'world' && <Suspense fallback={null}><DepartmentBackdrop department={department} reduced={reduced} /></Suspense>}
      <Sidebar active={active} onNavigate={navigate} />
      <div className="workspace">
        <Topbar title={titles[active]} />
        <div className="location-bar"><div><span className="location-mark" /> <strong>{department.name}</strong><span>/ {department.area}</span></div><div>{active === 'world' ? <button onClick={() => navigate(worldModule)}>Voltar ao painel</button> : <button onClick={() => navigate('world')}>Visitar ambiente 3D</button>}<button aria-pressed={!immersive} onClick={() => setImmersive(value => !value)}>{immersive ? 'Modo foco' : 'Ativar fundo 3D'}</button></div></div>
        <main className={`page-content ${active === 'world' ? 'world-content' : ''}`}>{content}</main>
      </div>
    </div>
  )
}
