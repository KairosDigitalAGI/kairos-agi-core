import { useState } from 'react'
import { Cloud, Database, Film, ExternalLink } from 'lucide-react'
import { useContentPipeline } from '../../core/useContentPipeline'
import { VideoGallery } from './VideoGallery'
import './video.css'

export function FilmLibraryPage({ embedded = false }: { embedded?: boolean }) {
  const [revision, setRevision] = useState(0)
  const { state, refresh } = useContentPipeline()
  const remote = state.status === 'ok' && state.data.source === 'real' ? state.data.assets.filter(asset => asset.tipo === 'video') : []
  const jobs = state.status === 'ok' && state.data.source === 'real' ? new Map(state.data.jobs.map(job => [job.id, job.titulo])) : new Map<string, string>()

  return <div className={`page-stack video-engine ${embedded ? 'video-engine-embedded' : ''}`}>
    {!embedded && <section className="glass-panel video-mode-hero"><div><span className="eyebrow">ACERVO PRIVADO · FILMES E CENAS</span><h2>Biblioteca de filmes</h2><p>Vídeos locais ficam neste navegador. Vídeos gerados pela Gateway ficam no banco operacional do Content Engine, vinculados ao job que os criou.</p></div><Film size={34} /></section>}

    <section className="glass-panel remote-film-library">
      <div className="editorial-row"><div><span className="eyebrow"><Cloud size={13} /> ACERVO OPERACIONAL</span><h3>Seedance, providers e pipeline</h3></div><button type="button" onClick={() => void refresh()}>Atualizar</button></div>
      {state.status === 'sem-credencial' && <p>Desbloqueie o Painel Operacional para consultar o banco real de vídeos.</p>}
      {state.status === 'carregando' && <p>Consultando acervo operacional…</p>}
      {state.status === 'erro' && <p className="editorial-alert">{state.mensagem}</p>}
      {state.status === 'ok' && state.data.source === 'unavailable' && <p>Acervo operacional indisponível: {state.data.reason}</p>}
      {state.status === 'ok' && state.data.source === 'real' && !remote.length && <div className="gallery-empty"><Database size={28} /><strong>Nenhum vídeo do servidor ainda</strong><p>Quando uma geração Seedance for concluída, ela aparecerá aqui com origem, job e uso devolvido pela Gateway.</p></div>}
      {remote.length > 0 && <div className="remote-film-grid">{remote.map(asset => <article key={asset.id}>
        {asset.url ? <video src={asset.url} controls preload="metadata" playsInline /> : <div className="remote-film-unavailable">Arquivo sem URL reproduzível</div>}
        <div><span>{asset.provedor ?? 'provider não informado'}</span><strong>{jobs.get(asset.job_id) ?? `Job ${asset.job_id}`}</strong><small>{new Date(asset.criado_em).toLocaleString('pt-BR')} · {asset.metadata?.model ?? 'modelo não informado'}</small><small>{asset.metadata?.usage ? 'Uso retornado pela Gateway registrado' : 'Uso ainda não retornado pelo provider'}</small>{asset.url && <a href={asset.url} target="_blank" rel="noreferrer"><ExternalLink size={14} />Abrir arquivo</a>}</div>
      </article>)}</div>}
    </section>

    <VideoGallery revision={revision} onImported={() => setRevision(current => current + 1)} />
  </div>
}
