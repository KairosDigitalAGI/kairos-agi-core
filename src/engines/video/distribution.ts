import type { DistributionConnection } from '../../types/video'

export const distributionConnections: DistributionConnection[] = [
  {
    channel: 'instagram', label: 'Instagram', connected: false, publishCostUsd: 0,
    requirement: 'Conta profissional, app Meta e permissão de publicação de conteúdo.',
    sourceUrl: 'https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/content-publishing',
  },
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
  {
    channel: 'x', label: 'X', connected: false, publishCostUsd: .015,
    requirement: 'A API cobra por publicação; o fluxo manual aprovado mantém custo de API zero.',
    sourceUrl: 'https://docs.x.com/x-api/getting-started/pricing',
  },
]
