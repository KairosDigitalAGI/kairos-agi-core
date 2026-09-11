import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { Clapperboard, Download, OctagonX, Play, Sparkles } from 'lucide-react'
import type { VideoGenerationPlan, VideoGenerationStyle, VideoJob, VideoQuality } from '../../types/video'
import { renderMotionVideo } from './motionRenderer'
import { compileStoryboard, generationDuration, validateGenerationPlan } from './storyboard'
import { safeOutputName } from './renderPlan'

const initialPlan: VideoGenerationPlan = {
  title: '', script: '', aspect: '9:16', quality: 'balanced', style: 'kairos', secondsPerScene: 4,
  watermark: '@_kairosdigital_', soundtrack: true,
}

interface Props { onJob: (job: VideoJob) => void }

function fileSize(bytes: number) { return new Intl.NumberFormat('pt-BR', { style: 'unit', unit: 'megabyte', maximumFractionDigits: 1 }).format(bytes / 1024 / 1024) }

export function VideoGenerator({ onJob }: Props) {
  const [plan, setPlan] = useState(initialPlan)
  const [status, setStatus] = useState<'idle' | 'rendering'>('idle')
  const [progress, setProgress] = useState(0)
  const [notice, setNotice] = useState('')
  const [output, setOutput] = useState<{ url: string; name: string; bytes: number; width: number; height: number } | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const scenes = useMemo(() => compileStoryboard(plan), [plan])
  const duration = generationDuration(scenes)

  useEffect(() => () => abortRef.current?.abort(), [])
  useEffect(() => () => { if (output?.url) URL.revokeObjectURL(output.url) }, [output])

  const generate = async () => {
    const issue = validateGenerationPlan(plan)
    if (issue) { setNotice(issue); return }
    if (output?.url) URL.revokeObjectURL(output.url)
    setOutput(null); setNotice(''); setProgress(0); setStatus('rendering')
    const controller = new AbortController(); abortRef.current = controller
    const jobId = crypto.randomUUID(); const createdAt = new Date().toISOString(); const outputName = safeOutputName(plan.title, 'kairos-motion.webm')
    try {
      const result = await renderMotionVideo({ plan, scenes, signal: controller.signal, onProgress: setProgress })
      const url = URL.createObjectURL(result.blob); setOutput({ url, name: outputName, bytes: result.blob.size, width: result.width, height: result.height })
      onJob({ id: jobId, kind: 'generated', sourceName: 'Roteiro do Founder', outputName, createdAt, finishedAt: new Date().toISOString(), status: 'completed', progress: 100, inputBytes: 0, outputBytes: result.blob.size, durationSeconds: result.durationSeconds, mimeType: result.mimeType, error: '' })
      setNotice('Vídeo criado do zero neste navegador. Baixe o arquivo antes de fechar a página.')
    } catch (error) {
      const cancelled = error instanceof DOMException && error.name === 'AbortError'; const message = cancelled ? 'Cancelado pelo Founder.' : error instanceof Error ? error.message : 'Falha desconhecida.'
      onJob({ id: jobId, kind: 'generated', sourceName: 'Roteiro do Founder', outputName, createdAt, finishedAt: new Date().toISOString(), status: cancelled ? 'cancelled' : 'failed', progress, inputBytes: 0, outputBytes: null, durationSeconds: duration, mimeType: null, error: message })
      setNotice(cancelled ? 'Geração cancelada.' : message)
    } finally { abortRef.current = null; setStatus('idle') }
  }

  return <>
    <section className="generator-grid">
      <form className="glass-panel video-controls generator-form" onSubmit={event => { event.preventDefault(); void generate() }}>
        <div><span className="eyebrow"><Sparkles size={13} /> GERADOR NATIVO · CUSTO ZERO</span><h2>Criar vídeo do zero</h2><p>Transforme seu roteiro em um motion video completo. Nenhum vídeo de entrada é necessário.</p></div>
        <label>Título<input value={plan.title} maxLength={80} placeholder="Ex.: A nova era da Kairos" onChange={event => setPlan({ ...plan, title: event.target.value })} /></label>
        <label>Roteiro<textarea value={plan.script} maxLength={3000} rows={9} placeholder={'Escreva uma frase por cena.\nCada linha vira uma sequência animada.'} onChange={event => setPlan({ ...plan, script: event.target.value })} /><small>{plan.script.length}/3.000 caracteres</small></label>
        <div className="video-fields"><label>Estilo<select value={plan.style} onChange={event => setPlan({ ...plan, style: event.target.value as VideoGenerationStyle })}><option value="kairos">Kairos Cyber</option><option value="minimal">Minimalista</option><option value="energy">Alta energia</option></select></label><label>Formato<select value={plan.aspect} onChange={event => setPlan({ ...plan, aspect: event.target.value as VideoGenerationPlan['aspect'] })}><option value="9:16">Vertical · 9:16</option><option value="1:1">Quadrado · 1:1</option><option value="16:9">Horizontal · 16:9</option></select></label></div>
        <div className="video-fields"><label>Qualidade<select value={plan.quality} onChange={event => setPlan({ ...plan, quality: event.target.value as VideoQuality })}><option value="economy">Econômica · 480p</option><option value="balanced">Equilibrada · 720p</option><option value="high">Alta · 1080p</option></select></label><label>Segundos por cena<input type="number" min="2" max="8" step="1" value={plan.secondsPerScene} onChange={event => setPlan({ ...plan, secondsPerScene: Number(event.target.value) })} /></label></div>
        <label>Marca d'água<input value={plan.watermark} maxLength={80} onChange={event => setPlan({ ...plan, watermark: event.target.value })} /></label>
        <label className="video-check"><input type="checkbox" checked={plan.soundtrack} onChange={event => setPlan({ ...plan, soundtrack: event.target.checked })} />Criar trilha ambiente sintetizada</label>
        {status === 'rendering' ? <div className="render-progress"><span style={{ width: `${progress}%` }} /><strong>{Math.round(progress)}%</strong><button type="button" onClick={() => abortRef.current?.abort()}><OctagonX size={16} />Cancelar</button></div> : <button className="primary-button render-button" type="submit"><Play size={17} />Gerar vídeo do zero</button>}
      </form>
      <aside className="glass-panel storyboard-panel"><div className="editorial-row"><div><span className="eyebrow">STORYBOARD AUTOMÁTICO</span><h3>{scenes.length || 0} cenas · {duration}s</h3></div><Clapperboard size={22} /></div>{!scenes.length && <p>O storyboard aparecerá quando o título e o roteiro estiverem completos.</p>}<div className="scene-list">{scenes.map((scene, index) => <article key={scene.id} style={{ '--scene-accent': scene.accent } as CSSProperties}><span>{String(index + 1).padStart(2, '0')}</span><div><small>{scene.kicker}</small><strong>{scene.headline}</strong></div><em>{scene.durationSeconds}s</em></article>)}</div></aside>
    </section>
    {output && <section className="glass-panel output-panel"><div><span className="eyebrow">VÍDEO GERADO DO ZERO</span><h3>{output.name}</h3><p>{output.width} × {output.height} · {fileSize(output.bytes)} · não publicado</p></div><a className="primary-button" href={output.url} download={output.name}><Download size={17} />Baixar vídeo</a></section>}
    {notice && <p className="editorial-alert" role="status">{notice}</p>}
  </>
}
