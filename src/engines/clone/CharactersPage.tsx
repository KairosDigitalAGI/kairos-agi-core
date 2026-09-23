import { useClone } from '../../core/CloneProvider'
import { LibraryPanel } from '../../features/libraries/LibraryPanel'
import { pressKitViews } from './pressKit'
import './clone.css'

const officialCharacters = [
  {
    name: 'KAIROS',
    role: 'Robô pessoal do Founder · interface operacional',
    image: '/characters/kairos-press-kit-v1.png',
    description: 'Robô não humano em cerâmica preta, visor violeta e luz azul. Referência de vistas, expressão de display e postura de interação.',
  },
  {
    name: 'ORION',
    role: 'Coordenação estratégica · sinal abstrato',
    image: '/characters/orion-press-kit-v1.png',
    description: 'Entidade não humana em vidro e órbitas de luz. Referência de vistas, núcleo, configuração ociosa e priorização ativa.',
  },
]

export function CharactersPage() {
  const { state } = useClone()
  const characters = state.records.filter(record => record.kind === 'character')
  return <div className="page-stack editorial clone-engine"><section className="glass-panel"><span className="eyebrow">CHARACTER STUDIO · CONTINUIDADE</span><h2>Personagens</h2><p>O elenco, os universos e as regras visuais das séries vivem aqui, separado da identidade do Founder.</p><p className="editorial-muted">{characters.length} personagens cadastrados neste navegador.</p><details className="clone-press-kit"><summary>Press kit mínimo para cada personagem</summary><ul>{pressKitViews.map(view => <li key={view}>{view}</li>)}</ul><p>Cadastre o caminho ou a referência privada das imagens e os direitos de uso na Character Bible.</p></details></section>

    <section className="character-reference-section glass-panel" aria-labelledby="character-reference-title">
      <div><span className="eyebrow">REFERÊNCIAS OFICIAIS · V0.1</span><h3 id="character-reference-title">KAIROS e ORION</h3><p>Os dois primeiros press kits do universo são ficcionais e não usam identidade humana. Founder e Wilson permanecem em áreas privadas e só entram após consentimento e autorização de destino.</p></div>
      <div className="character-reference-grid">{officialCharacters.map(character => <article key={character.name} className="character-reference-card"><img src={character.image} alt={`Press kit visual de ${character.name}`} /><div><strong>{character.name}</strong><span>{character.role}</span><p>{character.description}</p></div></article>)}</div>
    </section>

    <LibraryPanel kind="character" />
  </div>
}
