import { useState } from 'react'
import { useClone } from '../../core/CloneProvider'
import { LibraryPanel } from '../../features/libraries/LibraryPanel'
import type { LibraryKind } from '../../types/clone'
import './clone.css'

const cloneTabs: Array<[LibraryKind, string]> = [
  ['identity', 'Minha identidade'],
  ['face', 'Referências visuais'],
  ['voice', 'Referências de voz'],
  ['avatar', 'Avatares'],
]

export function ClonePage() {
  const { state, error } = useClone()
  const [tab, setTab] = useState<LibraryKind>('identity')
  const cloneRecords = state.records.filter(record => cloneTabs.some(([kind]) => kind === record.kind))
  return <div className="page-stack editorial clone-engine"><section className="glass-panel"><span className="eyebrow">FOUNDER EDITION · IDENTIDADE PRIVADA</span><h2>Clone Engine</h2><p>Somente o clone autorizado do Founder: identidade, rosto, voz e avatares. Personagens e filmes possuem áreas próprias.</p><p className="editorial-muted">{cloneRecords.length} referências do clone neste navegador. Nenhum arquivo é enviado, treinado ou publicado por esta página.</p></section>
    {error && <p role="alert" className="editorial-alert">{error}</p>}
    <nav className="editorial-tabs" aria-label="Biblioteca do Clone">{cloneTabs.map(([kind, label]) => <button key={kind} aria-pressed={tab === kind} onClick={() => setTab(kind)}>{label}</button>)}</nav>
    <LibraryPanel key={tab} kind={tab} />
  </div>
}