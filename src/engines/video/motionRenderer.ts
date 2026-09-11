import type { VideoGenerationPlan, VideoRenderResult, VideoScene } from '../../types/video'
import { outputDimensions, selectRecorderMime } from './renderPlan'

interface MotionRenderInput {
  plan: VideoGenerationPlan
  scenes: VideoScene[]
  onProgress: (progress: number) => void
  signal: AbortSignal
}

function roundedRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  context.beginPath(); context.roundRect(x, y, width, height, radius); context.fill()
}

function wrap(context: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(' '); const lines: string[] = []; let line = ''
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word
    if (context.measureText(candidate).width > maxWidth && line) { lines.push(line); line = word } else line = candidate
  }
  if (line) lines.push(line)
  return lines.slice(0, 6)
}

function seeded(seed: number, index: number) {
  const value = Math.sin(seed * 12.9898 + index * 78.233) * 43758.5453
  return value - Math.floor(value)
}

function drawFrame(context: CanvasRenderingContext2D, width: number, height: number, scene: VideoScene, sceneProgress: number, globalProgress: number, plan: VideoGenerationPlan) {
  const ease = 1 - Math.pow(1 - Math.min(1, sceneProgress * 1.8), 3)
  const background = context.createLinearGradient(0, 0, width, height)
  const base = plan.style === 'minimal' ? ['#0b0b0d', '#17171b', '#08080a'] : plan.style === 'energy' ? ['#10031c', '#111b3c', '#08010f'] : ['#030712', '#0b1020', '#05030d']
  background.addColorStop(0, base[0]); background.addColorStop(.48, base[1]); background.addColorStop(1, base[2])
  context.fillStyle = background; context.fillRect(0, 0, width, height)
  const glow = context.createRadialGradient(width * (.25 + sceneProgress * .35), height * .32, 0, width * .5, height * .4, width * .72)
  glow.addColorStop(0, `${scene.accent}aa`); glow.addColorStop(.42, `${scene.secondary}32`); glow.addColorStop(1, 'transparent')
  context.fillStyle = glow; context.fillRect(0, 0, width, height)
  context.strokeStyle = 'rgba(255,255,255,.055)'; context.lineWidth = 1
  const grid = Math.max(44, Math.round(width / 14)); const shift = (sceneProgress * grid * 2) % grid
  for (let x = -grid + shift; x < width + grid; x += grid) { context.beginPath(); context.moveTo(x, 0); context.lineTo(x, height); context.stroke() }
  for (let y = -grid + shift; y < height + grid; y += grid) { context.beginPath(); context.moveTo(0, y); context.lineTo(width, y); context.stroke() }
  const seed = parseInt(scene.id.split('-')[1] || '1', 36)
  for (let index = 0; index < 22; index++) {
    const angle = seeded(seed, index) * Math.PI * 2 + sceneProgress * (scene.motion === 'orbit' ? 2 : .5)
    const distance = seeded(seed + 2, index) * width * .55
    const x = width / 2 + Math.cos(angle) * distance
    const baseY = height / 2 + Math.sin(angle) * distance
    const y = scene.motion === 'rise' ? (baseY - sceneProgress * height * .35 + height) % height : baseY
    const radius = 2 + seeded(seed + 4, index) * 7 * (scene.motion === 'pulse' ? .7 + Math.sin(sceneProgress * Math.PI * 4) * .3 : 1)
    context.beginPath(); context.arc(x, y, radius, 0, Math.PI * 2); context.fillStyle = index % 2 ? scene.accent : scene.secondary; context.globalAlpha = .25 + seeded(seed + 5, index) * .55; context.fill()
  }
  context.globalAlpha = 1
  const margin = width * .085; const panelY = height * .22; const panelHeight = height * .52
  context.fillStyle = 'rgba(3,7,18,.66)'; roundedRect(context, margin, panelY, width - margin * 2, panelHeight, Math.max(20, width * .035))
  context.strokeStyle = `${scene.accent}88`; context.lineWidth = Math.max(2, width * .003); context.strokeRect(margin, panelY, 4, panelHeight)
  context.globalAlpha = ease; context.translate(0, (1 - ease) * 48)
  context.fillStyle = scene.secondary; context.font = `600 ${Math.max(17, width * .027)}px "DM Mono", monospace`; context.letterSpacing = `${Math.max(1, width * .003)}px`; context.fillText(scene.kicker.toUpperCase(), margin * 1.35, panelY + panelHeight * .18)
  const headlineSize = Math.max(36, width * (plan.aspect === '9:16' ? .075 : .052))
  context.letterSpacing = '0px'; context.fillStyle = '#ffffff'; context.font = `700 ${headlineSize}px Inter, sans-serif`
  const lines = wrap(context, scene.headline, width - margin * 2.7); const lineHeight = headlineSize * 1.08
  lines.forEach((line, index) => context.fillText(line, margin * 1.35, panelY + panelHeight * .36 + index * lineHeight))
  context.setTransform(1, 0, 0, 1, 0, 0); context.globalAlpha = 1
  context.fillStyle = 'rgba(255,255,255,.2)'; context.fillRect(margin, height - margin, width - margin * 2, 4)
  const progressGradient = context.createLinearGradient(margin, 0, width - margin, 0); progressGradient.addColorStop(0, scene.accent); progressGradient.addColorStop(1, scene.secondary)
  context.fillStyle = progressGradient; context.fillRect(margin, height - margin, (width - margin * 2) * globalProgress, 4)
  context.fillStyle = 'rgba(255,255,255,.82)'; context.font = `500 ${Math.max(15, width * .021)}px "DM Mono", monospace`; context.textAlign = 'right'; context.fillText(plan.watermark.trim(), width - margin, height - margin * .35); context.textAlign = 'left'
}

export async function renderMotionVideo({ plan, scenes, onProgress, signal }: MotionRenderInput): Promise<VideoRenderResult> {
  if (!scenes.length) throw new Error('O roteiro não produziu cenas válidas.')
  if (!('MediaRecorder' in window) || !HTMLCanvasElement.prototype.captureStream) throw new Error('Use Chrome ou Edge atualizado para gerar o vídeo localmente.')
  const mimeType = selectRecorderMime(MediaRecorder.isTypeSupported)
  if (!mimeType) throw new Error('Este navegador não oferece um formato WebM compatível.')
  const dimensions = outputDimensions(1920, 1080, plan.aspect, plan.quality)
  const canvas = document.createElement('canvas'); canvas.width = dimensions.width; canvas.height = dimensions.height
  const context = canvas.getContext('2d', { alpha: false })
  if (!context) throw new Error('Canvas indisponível neste navegador.')
  const tracks = [...canvas.captureStream(30).getVideoTracks()]
  let audioContext: AudioContext | null = null; const oscillators: OscillatorNode[] = []
  if (plan.soundtrack) {
    audioContext = new AudioContext(); const destination = audioContext.createMediaStreamDestination(); const master = audioContext.createGain(); master.gain.value = .035; master.connect(destination)
    for (const frequency of [110, 164.81, 220]) { const oscillator = audioContext.createOscillator(); oscillator.type = 'sine'; oscillator.frequency.value = frequency; oscillator.connect(master); oscillator.start(); oscillators.push(oscillator) }
    tracks.push(...destination.stream.getAudioTracks()); await audioContext.resume()
  }
  const stream = new MediaStream(tracks); const chunks: BlobPart[] = []
  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: plan.quality === 'high' ? 8_000_000 : plan.quality === 'balanced' ? 4_000_000 : 1_800_000 })
  recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data) }
  const finished = new Promise<void>((resolve, reject) => { recorder.onstop = () => resolve(); recorder.onerror = () => reject(new Error('O navegador interrompeu a geração.')) })
  const totalDuration = scenes.reduce((sum, scene) => sum + scene.durationSeconds, 0); const startedAt = performance.now()
  const stop = () => { if (recorder.state !== 'inactive') recorder.stop() }
  signal.addEventListener('abort', stop, { once: true }); recorder.start(500)
  try {
    await new Promise<void>((resolve, reject) => {
      const frame = (now: number) => {
        if (signal.aborted) { reject(new DOMException('Geração cancelada.', 'AbortError')); return }
        const elapsed = Math.min(totalDuration, (now - startedAt) / 1000); let cursor = 0; let scene = scenes[scenes.length - 1]; let sceneProgress = 1
        for (const candidate of scenes) { if (elapsed <= cursor + candidate.durationSeconds) { scene = candidate; sceneProgress = (elapsed - cursor) / candidate.durationSeconds; break } cursor += candidate.durationSeconds }
        const progress = Math.min(1, elapsed / totalDuration); drawFrame(context, canvas.width, canvas.height, scene, Math.max(0, sceneProgress), progress, plan); onProgress(progress * 100)
        if (elapsed >= totalDuration) resolve(); else requestAnimationFrame(frame)
      }
      requestAnimationFrame(frame)
    })
    stop(); await finished; onProgress(100)
    if (signal.aborted) throw new DOMException('Geração cancelada.', 'AbortError')
    const blob = new Blob(chunks, { type: mimeType }); if (!blob.size) throw new Error('A geração terminou sem produzir dados.')
    return { blob, mimeType, durationSeconds: totalDuration, ...dimensions }
  } finally {
    oscillators.forEach(oscillator => { try { oscillator.stop() } catch { /* already stopped */ } }); await audioContext?.close().catch(() => undefined); stream.getTracks().forEach(track => track.stop())
  }
}
