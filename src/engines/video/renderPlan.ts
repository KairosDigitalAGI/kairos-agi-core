import type { VideoAspect, VideoQuality, VideoRenderPlan } from '../../types/video'

export const MAX_INPUT_BYTES = 500 * 1024 * 1024
export const MAX_RENDER_SECONDS = 10 * 60

const aspectRatios: Record<Exclude<VideoAspect, 'original'>, number> = {
  '9:16': 9 / 16,
  '1:1': 1,
  '16:9': 16 / 9,
}

const qualityHeight: Record<VideoQuality, number> = {
  economy: 480,
  balanced: 720,
  high: 1080,
}

export function validateRenderPlan(plan: VideoRenderPlan, sourceDuration: number, inputBytes: number): string {
  if (!Number.isFinite(sourceDuration) || sourceDuration <= 0) return 'Não foi possível ler a duração do vídeo.'
  if (inputBytes <= 0 || inputBytes > MAX_INPUT_BYTES) return 'Use um vídeo válido de até 500 MB.'
  if (!Number.isFinite(plan.startSeconds) || !Number.isFinite(plan.endSeconds)) return 'O intervalo do vídeo é inválido.'
  if (plan.startSeconds < 0 || plan.endSeconds > sourceDuration || plan.endSeconds <= plan.startSeconds) return 'Escolha um início anterior ao fim, dentro da duração do vídeo.'
  if (plan.endSeconds - plan.startSeconds > MAX_RENDER_SECONDS) return 'Cada renderização pode ter no máximo 10 minutos.'
  if (plan.musicVolume < 0 || plan.musicVolume > 1) return 'O volume da música deve ficar entre zero e cem por cento.'
  return ''
}

export function outputDimensions(sourceWidth: number, sourceHeight: number, aspect: VideoAspect, quality: VideoQuality) {
  if (sourceWidth <= 0 || sourceHeight <= 0) throw new Error('Dimensões do vídeo inválidas.')
  const ratio = aspect === 'original' ? sourceWidth / sourceHeight : aspectRatios[aspect]
  const maxHeight = qualityHeight[quality]
  let height = Math.min(maxHeight, sourceHeight)
  let width = height * ratio
  if (width > 1920) { width = 1920; height = width / ratio }
  const even = (value: number) => Math.max(2, Math.round(value / 2) * 2)
  return { width: even(width), height: even(height) }
}

export function safeOutputName(title: string, sourceName: string) {
  const sourceBase = sourceName.replace(/\.[^.]+$/, '')
  const base = (title.trim() || sourceBase || 'kairos-video')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'kairos-video'
  return `${base}.webm`
}

export function selectRecorderMime(isSupported: (mime: string) => boolean) {
  return ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'].find(isSupported) || ''
}
