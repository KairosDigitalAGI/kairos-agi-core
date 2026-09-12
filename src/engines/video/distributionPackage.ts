import type { StoredVideo } from '../../types/video'

export const X_CHARACTER_LIMIT = 280

export function validateXCaption(caption: string) {
  const value = caption.trim()
  if (!value) return 'Escreva o texto que acompanhará o vídeo.'
  if ([...value].length > X_CHARACTER_LIMIT) return `O texto precisa ter no máximo ${X_CHARACTER_LIMIT} caracteres.`
  return ''
}

export function xComposeUrl(caption: string) {
  const issue = validateXCaption(caption)
  if (issue) throw new Error(issue)
  return `https://x.com/intent/post?text=${encodeURIComponent(caption.trim())}`
}

export function distributionManifest(video: StoredVideo, caption: string) {
  const issue = validateXCaption(caption)
  if (issue) throw new Error(issue)
  return JSON.stringify({
    version: 1,
    channel: 'x',
    mode: 'manual-free',
    video: { name: video.name, bytes: video.bytes, durationSeconds: video.durationSeconds, mimeType: video.mimeType },
    caption: caption.trim(),
    preparedAt: new Date().toISOString(),
    published: false,
  }, null, 2)
}
