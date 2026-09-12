import { useEffect, useRef, useState } from 'react'
import { Download, Film, Music2, OctagonX, Play, Scissors, ShieldCheck, Sparkles, Upload } from 'lucide-react'
import type { VideoJob, VideoQuality, VideoRenderPlan } from '../../types/video'
import { inspectVideo, renderVideo } from './browserRenderer'
import { MAX_INPUT_BYTES, safeOutputName, validateRenderPlan } from './renderPlan'
import { VideoGenerator } from './VideoGenerator'
import { VideoGallery } from './VideoGallery'
import { saveVideo } from './videoLibrary'
import { ProductionPlanner } from './ProductionPlanner'
import './video.css'

const HISTORY_KEY = 'kairos.video.jobs.v1'
const defaultPlan: VideoRenderPlan = { title: '', startSeconds: 0, endSeconds: 0, aspect: '9:16', quality: 'balanced', watermark: '@_kairosdigital_', includeAudio: true, musicVolume: .15 }

function loadHistory(): VideoJob[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
    return Array.isArray(parsed) ? parsed.filter(job => job && typeof job.id === 'string').slice(0, 25) : []
  } catch { return [] }
}

function fileSize(bytes: number) { return new Intl.NumberFormat('pt-BR', { style: 'unit', unit: 'megabyte', maximumFractionDigits: 1 }).format(bytes / 1024 / 1024) }
function clock(seconds: number) { const whole = Math.max(0, Math.round(seconds)); return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}` }

export function VideoPage() {
  const [mode, setMode] = useState<'generate' | 'edit'>('generate')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [musicFile, setMusicFile] = useState<File | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [outputUrl, setOutputUrl] = useState('')
  const [output, setOutput] = useState<{ name: string; bytes: number; width: number; height: number } | null>(null)
  const [metadata, setMetadata] = useState<{ duration: number; width: number; height: number } | null>(null)
  const [plan, setPlan] = useState(defaultPlan)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<'idle' | 'loading' | 'rendering'>('idle')
  const [notice, setNotice] = useState('')
  const [history, setHistory] = useState(loadHistory)
  const [libraryRevision, setLibraryRevision] = useState(0)
  const [generationSeed, setGenerationSeed] = useState<{ title: string; script: string; revision: number }>()
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => () => abortRef.current?.abort(), [])
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }, [previewUrl])
  useEffect(() => () => { if (outputUrl) URL.revokeObjectURL(outputUrl) }, [outputUrl])
  const saveJob = (job: VideoJob) => {
    setHistory(current => {
      const next = [job, ...current.filter(item => item.id !== job.id)].slice(0, 25)
      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(next)) } catch { setNotice('Render concluído, mas o histórico local não pôde ser salvo.') }
      return next
    })
  }
  const selectVideo = async (file: File | null) => {
    abortRef.current?.abort(); setNotice(''); setMetadata(null); setVideoFile(null); setOutput(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl); setPreviewUrl('')
    if (outputUrl) URL.revokeObjectURL(outputUrl); setOutputUrl('')
    if (!file) return
    if (!file.type.startsWith('video/') || file.size > MAX_INPUT_BYTES) { setNotice('Selecione um vídeo válido de até 500 MB.'); return }
    setStatus('loading')
    try {
      const info = await inspectVideo(file)
      setVideoFile(file); setPreviewUrl(info.url); setMetadata(info)
      setPlan(current => ({ ...current, title: file.name.replace(/\.[^.]+$/, ''), startSeconds: 0, endSeconds: Math.min(info.duration, 600) }))
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Não foi possível abrir o vídeo.') }
    finally { setStatus('idle') }
  }
  const startRender = async () => {
    if (!videoFile || !metadata) return
    const issue = validateRenderPlan(plan, metadata.duration, videoFile.size)
    if (issue) { setNotice(issue); return }
    if (outputUrl) URL.revokeObjectURL(outputUrl); setOutputUrl(''); setOutput(null); setNotice('')
    const controller = new AbortController(); abortRef.current = controller; setStatus('rendering'); setProgress(0)
    const jobId = crypto.randomUUID(); const outputName = safeOutputName(plan.title, videoFile.name); const createdAt = new Date().toISOString()
    try {
      const result = await renderVideo({ videoFile, musicFile, logoFile, plan, onProgress: setProgress, signal: controller.signal })
      const url = URL.createObjectURL(result.blob); setOutputUrl(url); setOutput({ name: outputName, bytes: result.blob.size, width: result.width, height: result.height })
      saveJob({ id: jobId, kind: 'edited', sourceName: videoFile.name, outputName, createdAt, finishedAt: new Date().toISOString(), status: 'completed', progress: 100, inputBytes: videoFile.size, outputBytes: result.blob.size, durationSeconds: result.durationSeconds, mimeType: result.mimeType, error: '' })
      try {
        await saveVideo({ id: jobId, name: outputName, createdAt, durationSeconds: result.durationSeconds, width: result.width, height: result.height, mimeType: result.mimeType, bytes: result.blob.size, kind: 'edited', blob: result.blob })
        setLibraryRevision(current => current + 1); setNotice('Vídeo processado e salvo na galeria deste navegador.')
      } catch { setNotice('Vídeo processado, mas o navegador não conseguiu salvá-lo na galeria. Baixe o arquivo agora.') }
    } catch (error) {
      const cancelled = error instanceof DOMException && error.name === 'AbortError'
      saveJob({ id: jobId, kind: 'edited', sourceName: videoFile.name, outputName, createdAt, finishedAt: new Date().toISOString(), status: cancelled ? 'cancelled' : 'failed', progress, inputBytes: videoFile.size, outputBytes: null, durationSeconds: plan.endSeconds - plan.startSeconds, mimeType: null, error: cancelled ? 'Cancelado pelo Founder.' : error instanceof Error ? error.message : 'Falha desconhecida.' })
      setNotice(cancelled ? 'Renderização cancelada.' : error instanceof Error ? error.message : 'A renderização falhou.')
    } finally { abortRef.current = null; setStatus('idle') }
  }

  return <div className="page-stack video-engine">
    <section className="glass-panel video-mode-hero"><div><span className="eyebrow">MISSÃO 004 · VIDEO ENGINE</span><h2>Criação e pós-produção local</h2><p>Comece por um roteiro ou refine um arquivo real. Os dois fluxos funcionam no navegador.</p></div><div className="video-mode-tabs" role="tablist"><button className={mode === 'generate' ? 'active' : ''} onClick={() => setMode('generate')}><Sparkles size={17} />Criar do zero</button><button className={mode === 'edit' ? 'active' : ''} onClick={() => setMode('edit')}><Scissors size={17} />Editar arquivo</button></div></section>
    {mode === 'generate' ? <>
      <ProductionPlanner onUseScript={(title, script) => setGenerationSeed({ title, script, revision: Date.now() })} />
      <VideoGenerator seed={generationSeed} onJob={saveJob} onStored={() => setLibraryRevision(current => current + 1)} />
    </> : <>
    <section className="video-workspace glass-panel">
      <div className="video-heading"><span className="eyebrow">MISSÃO 004 · PROCESSAMENTO LOCAL</span><h2>Video Engine</h2><p>Selecione um vídeo real, escolha o enquadramento e gere um WebM sem enviar o arquivo para servidores.</p></div>
      <label className="video-drop"><Upload size={26} /><strong>{status === 'loading' ? 'Lendo vídeo…' : videoFile ? videoFile.name : 'Selecionar vídeo'}</strong><span>MP4, MOV, WebM ou outro formato aceito pelo navegador · até 500 MB</span><input type="file" accept="video/*" disabled={status !== 'idle'} onChange={event => void selectVideo(event.target.files?.[0] || null)} /></label>
      {videoFile && metadata && <div className="source-facts"><span>{fileSize(videoFile.size)}</span><span>{metadata.width} × {metadata.height}</span><span>{clock(metadata.duration)}</span><span>Arquivo local</span></div>}
    </section>

    {videoFile && metadata && <section className="video-grid">
      <article className="glass-panel video-preview"><h3>Original</h3><video src={previewUrl} controls playsInline preload="metadata" /><p>O arquivo permanece neste dispositivo.</p></article>
      <form className="glass-panel video-controls" onSubmit={event => { event.preventDefault(); void startRender() }}>
        <h3>Plano de render</h3>
        <label>Nome do arquivo<input value={plan.title} maxLength={80} onChange={event => setPlan({ ...plan, title: event.target.value })} /></label>
        <div className="video-fields"><label>Início, segundos<input type="number" min="0" max={metadata.duration} step="0.1" value={plan.startSeconds} onChange={event => setPlan({ ...plan, startSeconds: Number(event.target.value) })} /></label><label>Fim, segundos<input type="number" min="0.1" max={metadata.duration} step="0.1" value={plan.endSeconds} onChange={event => setPlan({ ...plan, endSeconds: Number(event.target.value) })} /></label></div>
        <div className="video-fields"><label>Formato<select value={plan.aspect} onChange={event => setPlan({ ...plan, aspect: event.target.value as VideoRenderPlan['aspect'] })}><option value="9:16">Vertical · 9:16</option><option value="1:1">Quadrado · 1:1</option><option value="16:9">Horizontal · 16:9</option><option value="original">Original</option></select></label><label>Qualidade<select value={plan.quality} onChange={event => setPlan({ ...plan, quality: event.target.value as VideoQuality })}><option value="economy">Econômica · até 480p</option><option value="balanced">Equilibrada · até 720p</option><option value="high">Alta · até 1080p</option></select></label></div>
        <label>Marca d'água<input value={plan.watermark} maxLength={80} onChange={event => setPlan({ ...plan, watermark: event.target.value })} /></label>
        <label className="video-file"><Film size={17} />Logo opcional<input type="file" accept="image/png,image/jpeg,image/webp" onChange={event => setLogoFile(event.target.files?.[0] || null)} /><span>{logoFile?.name || 'Nenhum logo'}</span></label>
        <label className="video-file"><Music2 size={17} />Música opcional<input type="file" accept="audio/*" onChange={event => setMusicFile(event.target.files?.[0] || null)} /><span>{musicFile?.name || 'Sem música'}</span></label>
        {musicFile && <label>Volume da música · {Math.round(plan.musicVolume * 100)}%<input type="range" min="0" max="0.5" step="0.01" value={plan.musicVolume} onChange={event => setPlan({ ...plan, musicVolume: Number(event.target.value) })} /></label>}
        <label className="video-check"><input type="checkbox" checked={plan.includeAudio} onChange={event => setPlan({ ...plan, includeAudio: event.target.checked })} />Manter áudio original</label>
        {status === 'rendering' ? <div className="render-progress"><span style={{ width: `${progress}%` }} /><strong>{Math.round(progress)}%</strong><button type="button" onClick={() => abortRef.current?.abort()}><OctagonX size={16} />Cancelar</button></div> : <button className="primary-button render-button" type="submit"><Play size={17} />Renderizar neste dispositivo</button>}
      </form>
    </section>}

    {output && <section className="glass-panel output-panel"><div><span className="eyebrow">RESULTADO LOCAL</span><h3>{output.name}</h3><p>{output.width} × {output.height} · {fileSize(output.bytes)} · não publicado</p></div><a className="primary-button" href={outputUrl} download={output.name}><Download size={17} />Baixar vídeo</a></section>}
    {notice && <p className="editorial-alert" role="status">{notice}</p>}</>}
    <section className="glass-panel local-security"><ShieldCheck size={24} /><div><h3>Privacidade e custo</h3><p>Roteiro e mídias são processados pelo navegador. A saída é WebM. Nada é enviado à Kairos, Meta ou provedores de IA; custo de API zero.</p></div></section>
    <VideoGallery revision={libraryRevision} />
    <section className="glass-panel"><div className="editorial-row"><div><span className="eyebrow">HISTÓRICO DESTE NAVEGADOR</span><h3>{history.length} renderizações registradas</h3></div>{history.length > 0 && <button onClick={() => { localStorage.removeItem(HISTORY_KEY); setHistory([]) }}>Limpar histórico</button>}</div>
      {!history.length && <p>Nenhum vídeo renderizado neste navegador.</p>}
      <div className="render-history">{history.map(job => <article key={job.id}><span className={`render-state ${job.status}`}>{job.status === 'completed' ? 'Concluído' : job.status === 'cancelled' ? 'Cancelado' : 'Falhou'}</span><strong>{job.outputName}<small className="job-kind">{job.kind === 'generated' ? 'criado do zero' : job.kind === 'edited' ? 'editado' : 'legado'}</small></strong><small>{new Date(job.createdAt).toLocaleString('pt-BR')} · {clock(job.durationSeconds)}{job.outputBytes ? ` · ${fileSize(job.outputBytes)}` : ''}</small>{job.error && <p>{job.error}</p>}</article>)}</div>
    </section>
  </div>
}
