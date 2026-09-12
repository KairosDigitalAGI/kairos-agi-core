import type { CampaignBrief, CampaignEstimate, GenerativeModel } from '../../types/video'

export const VIDEO_PRICING_VERIFIED_AT = '2026-09-11'

export const generativeModels: GenerativeModel[] = [
  {
    id: 'browser-local', provider: 'local', label: 'Kairos Motion local', media: 'video',
    capability: 'Motion graphics no navegador', usdPerUnit: 0, unit: 'second', connected: true,
    sourceUrl: '', verifiedAt: VIDEO_PRICING_VERIFIED_AT,
  },
  {
    id: 'runway-gen4-turbo', provider: 'runway', label: 'Runway Gen-4 Turbo', media: 'video',
    capability: 'Image-to-video rápido', usdPerUnit: .05, unit: 'second', connected: false,
    sourceUrl: 'https://docs.dev.runwayml.com/guides/pricing/', verifiedAt: VIDEO_PRICING_VERIFIED_AT,
  },
  {
    id: 'runway-gen4.5', provider: 'runway', label: 'Runway Gen-4.5', media: 'video',
    capability: 'Vídeo premium com maior fidelidade', usdPerUnit: .12, unit: 'second', connected: false,
    sourceUrl: 'https://docs.dev.runwayml.com/guides/pricing/', verifiedAt: VIDEO_PRICING_VERIFIED_AT,
  },
  {
    id: 'runway-seedance2.5-480p', provider: 'runway', label: 'Seedance 2.5 · 480p', media: 'video',
    capability: 'Narrativa generativa e cenas com referências', usdPerUnit: .2, unit: 'second', connected: false,
    sourceUrl: 'https://docs.dev.runwayml.com/guides/pricing/', verifiedAt: VIDEO_PRICING_VERIFIED_AT,
  },
  {
    id: 'runway-veo3.1-fast-audio', provider: 'runway', label: 'Veo 3.1 Fast + áudio', media: 'video',
    capability: 'Cena generativa com áudio sincronizado', usdPerUnit: .15, unit: 'second', connected: false,
    sourceUrl: 'https://docs.dev.runwayml.com/guides/pricing/', verifiedAt: VIDEO_PRICING_VERIFIED_AT,
  },
  {
    id: 'runway-gemini-2.5-flash', provider: 'runway', label: 'Gemini 2.5 Flash Image', media: 'image',
    capability: 'Frames de referência econômicos', usdPerUnit: .05, unit: 'image', connected: false,
    sourceUrl: 'https://docs.dev.runwayml.com/guides/pricing/', verifiedAt: VIDEO_PRICING_VERIFIED_AT,
  },
  {
    id: 'runway-gpt-image-2.5', provider: 'runway', label: 'GPT Image 2.5 · alta 1K/2K', media: 'image',
    capability: 'Frames premium; perfil de alta qualidade', usdPerUnit: .16, unit: 'image', connected: false,
    sourceUrl: 'https://docs.dev.runwayml.com/guides/pricing/', verifiedAt: VIDEO_PRICING_VERIFIED_AT,
  },
]

export function estimateCampaign(brief: CampaignBrief): CampaignEstimate {
  const video = generativeModels.find(model => model.id === brief.videoModelId && model.media === 'video')
  const image = generativeModels.find(model => model.id === brief.imageModelId && model.media === 'image')
  if (!video) return { videoUsd: 0, imagesUsd: 0, totalUsd: 0, status: 'unavailable' }
  const roundUsd = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100
  const videoUsd = roundUsd(video.usdPerUnit * Math.max(0, brief.durationSeconds))
  const imagesUsd = roundUsd(image ? image.usdPerUnit * Math.max(0, brief.imageCount) : 0)
  const totalUsd = roundUsd(videoUsd + imagesUsd)
  return { videoUsd, imagesUsd, totalUsd, status: totalUsd === 0 ? 'free' : 'estimate' }
}

export function buildConversionScript(brief: CampaignBrief) {
  const fields = [brief.product, brief.audience, brief.promise, brief.callToAction]
  if (fields.some(value => value.trim().length < 3)) return ''
  return [
    `${brief.audience.trim()}, isto está travando seu resultado?`,
    brief.promise.trim(),
    brief.proof.trim() || `${brief.product.trim()} transforma o processo em uma execução clara.`,
    `Conheça ${brief.product.trim()}.`,
    brief.callToAction.trim(),
  ].join('\n')
}
