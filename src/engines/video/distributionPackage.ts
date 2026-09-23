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

// Modo display/link real do Content Engine (Missão 006, Fase 17, item 5 do
// backlog noturno: "X display/link only, sem automação"). Diferente de
// distributionManifest acima (que empacota um StoredVideo local, blob no
// navegador), aqui o vídeo já existe publicamente em content_assets.storage_path
// — então o "pacote" é só texto + link. xShareComposeUrl nunca chama a API
// paga do X nem publica sozinho: só monta a URL do compositor oficial
// (x.com/intent/post), que o Founder abre, revisa e decide publicar ele mesmo.
export function buildXShareText(caption: string, videoUrl: string) {
  return `${caption.trim()}\n\n${videoUrl.trim()}`.trim()
}

export function validateXShareCaption(caption: string, videoUrl: string) {
  if (!caption.trim()) return 'Escreva o texto que acompanhará o link do vídeo.'
  return validateXCaption(buildXShareText(caption, videoUrl))
}

export function xShareComposeUrl(caption: string, videoUrl: string) {
  const issue = validateXShareCaption(caption, videoUrl)
  if (issue) throw new Error(issue)
  return xComposeUrl(buildXShareText(caption, videoUrl))
}
