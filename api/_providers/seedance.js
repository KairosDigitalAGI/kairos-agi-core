// Seedance 2.5 via Vercel AI Gateway.  This adapter deliberately has no
// fallback: a missing Gateway credential or a model error stops the job so a
// failed provider never becomes an untracked paid retry somewhere else.
import { experimental_generateVideo as generateVideo } from 'ai'

export const name = 'vercel-ai-gateway'
export const MODEL = 'bytedance/seedance-2.5'

export function hasCredentials() {
  // Vercel injects VERCEL_OIDC_TOKEN for deployed functions.  A local
  // developer may instead use the short-lived, budgeted API key.  Neither is
  // exposed to the client or written to the repository.
  return Boolean(process.env.VERCEL_OIDC_TOKEN || process.env.AI_GATEWAY_API_KEY)
}

export async function generateSeedanceVideo({ prompt, duration = 8, aspectRatio = '9:16', resolution = '1280x720', generateAudio = true }) {
  if (!hasCredentials()) throw new Error('AI Gateway não autenticado: VERCEL_OIDC_TOKEN ou AI_GATEWAY_API_KEY ausente.')
  if (typeof prompt !== 'string' || !prompt.trim()) throw new Error('seedance: prompt vazio')
  if (!Number.isInteger(duration) || duration < 4 || duration > 30) throw new Error('seedance: duração deve estar entre 4 e 30 segundos')

  const result = await generateVideo({
    model: MODEL,
    prompt,
    duration,
    aspectRatio,
    resolution,
    generateAudio,
  })
  const video = result.videos?.[0]
  if (!video?.uint8Array?.byteLength) throw new Error('seedance: a Gateway não retornou um arquivo de vídeo')

  return {
    bytes: video.uint8Array,
    mediaType: video.mediaType || 'video/mp4',
    model: MODEL,
    usage: result.usage || null,
  }
}
