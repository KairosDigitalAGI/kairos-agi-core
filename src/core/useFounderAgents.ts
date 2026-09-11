import { agents } from '../data/operational'
import { useEditorial } from './EditorialProvider'
import type { FounderAgent } from '../types'
export function useFounderAgents(): FounderAgent[] {
  const { state } = useEditorial()
  const pending = state.items.filter(i => i.stage === 'Aprovação').length
  const approved = state.items.filter(i => i.stage === 'Publicação').length
  return agents.map(agent => agent.id !== 'instagram-ai' ? agent : {
    ...agent,
    task: pending ? pending + ' conteúdo(s) aguardando revisão do Founder.' : approved ? approved + ' conteúdo(s) aprovado(s); API desconectada.' : state.items.length + ' conteúdos cadastrados localmente; executor desconectado.',
    status: pending ? 'Em revisão' : 'Aguardando',
    progress: 0,
  })
}
