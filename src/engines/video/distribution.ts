import type { DistributionConnection } from '../../types/video'

export const distributionConnections: DistributionConnection[] = [
  {
    channel: 'youtube', label: 'YouTube', connected: false, publishCostUsd: 0,
    requirement: 'OAuth Google, canal selecionado e YouTube Data API habilitada.',
    sourceUrl: 'https://developers.google.com/youtube/v3/guides/uploading_a_video',
  },
  {
    channel: 'tiktok', label: 'TikTok', connected: false, publishCostUsd: 0,
    requirement: 'App TikTok aprovado, OAuth e consentimento explícito antes de cada envio.',
    sourceUrl: 'https://developers.tiktok.com/products/content-posting-api',
  },
]
