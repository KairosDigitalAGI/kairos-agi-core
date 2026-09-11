import type { ModuleKey } from '../types'
export interface Department { name: string; area: string; color: string; camera: [number, number, number]; target: [number, number, number] }
const founder: Department = { name: 'Founder Tower', area: 'Sala de comando', color: '#8b5cf6', camera: [0, 12, 25], target: [0, 1, -2] }
const sales: Department = { name: 'Sales District', area: 'CRM e relacionamento', color: '#38bdf8', camera: [-3, 6, 10], target: [-10, 1, -3] }
const social: Department = { name: 'Social District', area: 'Estúdio editorial', color: '#f472b6', camera: [3, 6, 9], target: [10, 1, -4] }
const studio: Department = { name: 'Studio District', area: 'Clone do Founder', color: '#a78bfa', camera: [5, 5, 16], target: [0, 1, 8] }
const money: Department = { name: 'Money Lab', area: 'Inteligência de negócios', color: '#34d399', camera: [-6, 7, -2], target: [4, 2, -14] }
const infra: Department = { name: 'Infrastructure', area: 'Controle da plataforma', color: '#60a5fa', camera: [12, 7, 7], target: [12, 2, -10] }
export const departments: Record<ModuleKey, Department> = {
  dashboard: founder, missions: founder, world: founder,
  clients: sales, crm: sales, hunter: { ...sales, area: 'Hunter · prospecção' },
  instagram: social, clone: studio, 'money-lab': money,
  analytics: { ...infra, area: 'Analytics' }, settings: infra,
  vault: { ...infra, name: 'Vault District', area: 'Identidades · ainda vazio' },
}
