import { useClone } from '../../core/CloneProvider'
import { LibraryPanel } from '../../features/libraries/LibraryPanel'
import { pressKitViews } from './pressKit'
import './clone.css'

export function CharactersPage() {
  const { state } = useClone()
  const characters = state.records.filter(record => record.kind === 'character')
  return <div className="page-stack editorial clone-engine"><section className="glass-panel"><span className="eyebrow">CHARACTER STUDIO · CONTINUIDADE</span><h2>Personagens</h2><p>O elenco, os universos e as regras visuais das séries vivem aqui, separado da identidade do Founder.</p><p className="editorial-muted">{characters.length} personagens cadastrados neste navegador.</p><details className="clone-press-kit"><summary>Press kit mínimo para cada personagem</summary><ul>{pressKitViews.map(view => <li key={view}>{view}</li>)}</ul><p>Cadastre o caminho ou a referência privada das imagens e os direitos de uso na Character Bible.</p></details></section>
    <LibraryPanel kind="character" />
  </div>
}