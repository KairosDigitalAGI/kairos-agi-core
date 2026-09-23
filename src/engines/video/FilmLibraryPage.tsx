import { useState } from 'react'
import { Film } from 'lucide-react'
import { VideoGallery } from './VideoGallery'
import './video.css'

export function FilmLibraryPage() {
  const [revision, setRevision] = useState(0)
  return <div className="page-stack video-engine"><section className="glass-panel video-mode-hero"><div><span className="eyebrow">ACERVO PRIVADO · FILMES E CENAS</span><h2>Biblioteca de filmes</h2><p>Todos os vídeos gerados, editados ou importados neste navegador ficam organizados aqui. A Video Engine só cria e edita.</p></div><Film size={34} /></section>
    <VideoGallery revision={revision} onImported={() => setRevision(current => current + 1)} />
  </div>
}