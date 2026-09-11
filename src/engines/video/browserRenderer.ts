import type { VideoRenderPlan, VideoRenderResult } from '../../types/video'
import { outputDimensions, selectRecorderMime, validateRenderPlan } from './renderPlan'

interface RenderInput {
  videoFile: File
  musicFile?: File | null
  logoFile?: File | null
  plan: VideoRenderPlan
  onProgress: (progress: number) => void
  signal: AbortSignal
}

function eventOnce(target: EventTarget, event: string, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const done = () => { cleanup(); resolve() }
    const failed = () => { cleanup(); reject(new Error('O navegador não conseguiu decodificar este arquivo.')) }
    const abort = () => { cleanup(); reject(new DOMException('Renderização cancelada.', 'AbortError')) }
    const cleanup = () => { target.removeEventListener(event, done); target.removeEventListener('error', failed); signal.removeEventListener('abort', abort) }
    target.addEventListener(event, done, { once: true }); target.addEventListener('error', failed, { once: true }); signal.addEventListener('abort', abort, { once: true })
  })
}

async function loadImage(file: File | null | undefined, signal: AbortSignal) {
  if (!file) return null
  const url = URL.createObjectURL(file)
  try {
    const image = new Image(); image.src = url
    await Promise.race([
      image.decode(),
      new Promise<never>((_, reject) => signal.addEventListener('abort', () => reject(new DOMException('Renderização cancelada.', 'AbortError')), { once: true })),
    ])
    if (signal.aborted) throw new DOMException('Renderização cancelada.', 'AbortError')
    return image
  } finally { URL.revokeObjectURL(url) }
}

function drawCover(context: CanvasRenderingContext2D, video: HTMLVideoElement, width: number, height: number) {
  const scale = Math.max(width / video.videoWidth, height / video.videoHeight)
  const drawWidth = video.videoWidth * scale
  const drawHeight = video.videoHeight * scale
  context.drawImage(video, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight)
}

export async function inspectVideo(file: File, signal = new AbortController().signal) {
  if (!file.type.startsWith('video/')) throw new Error('Selecione um arquivo de vídeo.')
  const url = URL.createObjectURL(file)
  const video = document.createElement('video')
  video.preload = 'metadata'; video.src = url
  try {
    await eventOnce(video, 'loadedmetadata', signal)
    return { duration: video.duration, width: video.videoWidth, height: video.videoHeight, url }
  } catch (error) { URL.revokeObjectURL(url); throw error }
}

export async function renderVideo({ videoFile, musicFile, logoFile, plan, onProgress, signal }: RenderInput): Promise<VideoRenderResult> {
  if (!('MediaRecorder' in window) || !HTMLCanvasElement.prototype.captureStream) throw new Error('Este navegador não suporta renderização local. Use Chrome ou Edge atualizado.')
  const mimeType = selectRecorderMime(MediaRecorder.isTypeSupported)
  if (!mimeType) throw new Error('Este navegador não oferece um formato WebM compatível.')
  const sourceUrl = URL.createObjectURL(videoFile)
  const musicUrl = musicFile ? URL.createObjectURL(musicFile) : null
  const video = document.createElement('video')
  video.src = sourceUrl; video.preload = 'auto'; video.playsInline = true; video.crossOrigin = 'anonymous'; video.muted = !plan.includeAudio
  const music = musicUrl ? document.createElement('audio') : null
  if (music && musicUrl) { music.src = musicUrl; music.preload = 'auto'; music.loop = true }
  let audioContext: AudioContext | null = null
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d', { alpha: false })
  try {
    if (!context) throw new Error('Canvas indisponível neste navegador.')
    await eventOnce(video, 'loadedmetadata', signal)
    const error = validateRenderPlan(plan, video.duration, videoFile.size)
    if (error) throw new Error(error)
    const dimensions = outputDimensions(video.videoWidth, video.videoHeight, plan.aspect, plan.quality)
    canvas.width = dimensions.width; canvas.height = dimensions.height
    const logo = await loadImage(logoFile, signal)
    const canvasStream = canvas.captureStream(30)
    const tracks: MediaStreamTrack[] = [...canvasStream.getVideoTracks()]
    if (plan.includeAudio || music) {
      audioContext = new AudioContext()
      const destination = audioContext.createMediaStreamDestination()
      if (plan.includeAudio) audioContext.createMediaElementSource(video).connect(destination)
      if (music) { const gain = audioContext.createGain(); gain.gain.value = plan.musicVolume; audioContext.createMediaElementSource(music).connect(gain).connect(destination) }
      tracks.push(...destination.stream.getAudioTracks())
      await audioContext.resume()
    }
    const stream = new MediaStream(tracks)
    const chunks: BlobPart[] = []
    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: plan.quality === 'high' ? 8_000_000 : plan.quality === 'balanced' ? 4_000_000 : 1_800_000 })
    recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data) }
    const finished = new Promise<void>((resolve, reject) => { recorder.onstop = () => resolve(); recorder.onerror = () => reject(new Error('O navegador interrompeu a gravação.')) })
    const stop = () => { video.pause(); music?.pause(); if (recorder.state !== 'inactive') recorder.stop() }
    signal.addEventListener('abort', stop, { once: true })
    if (Math.abs(video.currentTime - plan.startSeconds) > .01) {
      video.currentTime = plan.startSeconds
      await eventOnce(video, 'seeked', signal)
    }
    if (music) music.currentTime = 0
    recorder.start(1000); await video.play(); if (music) await music.play()
    const renderDuration = plan.endSeconds - plan.startSeconds
    await new Promise<void>((resolve, reject) => {
      const frame = () => {
        if (signal.aborted) { reject(new DOMException('Renderização cancelada.', 'AbortError')); return }
        context.fillStyle = '#05070d'; context.fillRect(0, 0, canvas.width, canvas.height)
        drawCover(context, video, canvas.width, canvas.height)
        if (plan.watermark.trim()) {
          context.font = `600 ${Math.max(18, Math.round(canvas.height * .026))}px Inter, sans-serif`
          context.textAlign = 'right'; context.textBaseline = 'bottom'
          const padding = Math.round(canvas.width * .025); const text = plan.watermark.trim()
          const metrics = context.measureText(text); context.fillStyle = 'rgba(4,7,13,.65)'
          context.fillRect(canvas.width - metrics.width - padding * 2, canvas.height - 58, metrics.width + padding, 42)
          context.fillStyle = '#ffffff'; context.fillText(text, canvas.width - padding, canvas.height - 26)
        }
        if (logo) {
          const logoWidth = canvas.width * .12; const logoHeight = logo.height / logo.width * logoWidth
          context.globalAlpha = .8; context.drawImage(logo, canvas.width - logoWidth - 22, 22, logoWidth, logoHeight); context.globalAlpha = 1
        }
        const progress = Math.min(100, Math.max(0, (video.currentTime - plan.startSeconds) / renderDuration * 100))
        onProgress(progress)
        if (video.currentTime >= plan.endSeconds || video.ended) { resolve(); return }
        video.requestVideoFrameCallback ? video.requestVideoFrameCallback(() => frame()) : requestAnimationFrame(frame)
      }
      frame()
    })
    stop(); await finished; onProgress(100)
    if (signal.aborted) throw new DOMException('Renderização cancelada.', 'AbortError')
    const blob = new Blob(chunks, { type: mimeType })
    if (!blob.size) throw new Error('O navegador concluiu a gravação sem produzir dados.')
    return { blob, mimeType, durationSeconds: renderDuration, ...dimensions }
  } finally {
    video.pause(); music?.pause(); await audioContext?.close().catch(() => undefined)
    URL.revokeObjectURL(sourceUrl); if (musicUrl) URL.revokeObjectURL(musicUrl)
  }
}
