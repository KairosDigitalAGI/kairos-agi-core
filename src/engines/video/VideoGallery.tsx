import { useEffect, useState } from 'react'
import { Download, ExternalLink, Film, PackageCheck, Trash2 } from 'lucide-react'
import type { StoredVideo } from '../../types/video'
import { deleteVideo, listVideos } from './videoLibrary'
import { distributionManifest, validateXCaption, X_CHARACTER_LIMIT, xComposeUrl } from './distributionPackage'

interface GalleryVideo extends StoredVideo { url: string }
interface Props { revision: number }

function fileSize(bytes: number) { return new Intl.NumberFormat('pt-BR', { style: 'unit', unit: 'megabyte', maximumFractionDigits: 1 }).format(bytes / 1024 / 1024) }
function clock(seconds: number) { const whole = Math.max(0, Math.round(seconds)); return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}` }

export function VideoGallery({ revision }: Props) {
  const [videos, setVideos] = useState<GalleryVideo[]>([])
  const [notice, setNotice] = useState('')
  const [captions, setCaptions] = useState<Record<string, string>>({})

  useEffect(() => {
    let active = true; let urls: string[] = []
    void listVideos().then(records => {
      if (!active) return
      const next = records.map(video => ({ ...video, url: URL.createObjectURL(video.blob) })); urls = next.map(video => video.url); setVideos(next); setNotice('')
    }).catch(error => { if (active) setNotice(error instanceof Error ? error.message : 'A galeria local não pôde ser lida.') })
    return () => { active = false; urls.forEach(url => URL.revokeObjectURL(url)) }
  }, [revision])

  const remove = async (video: GalleryVideo) => {
    if (!window.confirm(`Remover “${video.name}” desta galeria local?`)) return
    try { await deleteVideo(video.id); URL.revokeObjectURL(video.url); setVideos(current => current.filter(item => item.id !== video.id)) }
    catch (error) { setNotice(error instanceof Error ? error.message : 'O vídeo não pôde ser removido.') }
  }

  const downloadPackage = (video: GalleryVideo) => {
    const caption = captions[video.id] || ''
    const issue = validateXCaption(caption)
    if (issue) { setNotice(issue); return }
    const blob = new Blob([distributionManifest(video, caption)], { type: 'application/json' })
    const url = URL.createObjectURL(blob); const anchor = document.createElement('a')
    anchor.href = url; anchor.download = `${video.name.replace(/\.[^.]+$/, '')}-x-package.json`; anchor.click(); URL.revokeObjectURL(url)
    setNotice('Pacote do X preparado. Anexe o vídeo baixado e revise o texto antes de publicar.')
  }

  return <section className="glass-panel video-library"><div className="editorial-row"><div><span className="eyebrow"><Film size={13} /> GALERIA LOCAL</span><h3>{videos.length} vídeos salvos</h3></div><span className="library-storage">IndexedDB · este navegador</span></div>
    {notice && <p className="editorial-alert" role="status">{notice}</p>}
    {!videos.length && !notice && <div className="gallery-empty"><Film size={28} /><strong>Nenhum vídeo salvo ainda</strong><p>As próximas gerações e edições concluídas aparecerão aqui e continuarão disponíveis após recarregar.</p></div>}
    <div className="video-gallery-grid">{videos.map(video => { const caption = captions[video.id] || ''; const issue = validateXCaption(caption); return <article key={video.id}><video src={video.url} controls preload="metadata" playsInline /><div className="gallery-card-copy"><span>{video.kind === 'generated' ? 'Criado do zero' : 'Editado'}</span><strong>{video.name}</strong><small>{new Date(video.createdAt).toLocaleString('pt-BR')} · {clock(video.durationSeconds)} · {fileSize(video.bytes)}</small><label className="x-caption">Texto para X<textarea rows={3} maxLength={X_CHARACTER_LIMIT} value={caption} onChange={event => setCaptions(current => ({ ...current, [video.id]: event.target.value }))} /><small>{[...caption].length}/{X_CHARACTER_LIMIT}</small></label><div><a href={video.url} download={video.name}><Download size={15} />Baixar vídeo</a><button onClick={() => downloadPackage(video)}><PackageCheck size={15} />Pacote X</button>{!issue && <a href={xComposeUrl(caption)} target="_blank" rel="noreferrer"><ExternalLink size={15} />Abrir X</a>}<button onClick={() => void remove(video)} aria-label={`Remover ${video.name}`}><Trash2 size={15} />Remover</button></div></div></article> })}</div>
  </section>
}
