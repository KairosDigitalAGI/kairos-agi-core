import type { IntegrationProviderId } from '../types/integration'

export interface IntegrationDefinition {
  id: IntegrationProviderId
  label: string
  purpose: string
  portalUrl: string
  cost: string
  requirement: string
}

export const integrationCatalog: IntegrationDefinition[] = [
  {
    id: 'instagram', label: 'Instagram', purpose: 'Publicar Reels e consultar resultados reais da @_kairosdigital_.',
    portalUrl: 'https://developers.facebook.com/apps/', cost: 'API sem custo por publicação',
    requirement: 'Conta profissional, aplicativo Meta e permissão instagram_business_content_publish.',
  },
  {
    id: 'youtube', label: 'YouTube', purpose: 'Enviar Shorts e consultar o canal autorizado.',
    portalUrl: 'https://console.cloud.google.com/apis/credentials', cost: 'API com cota gratuita do Google',
    requirement: 'Canal existente, YouTube Data API habilitada e cliente OAuth Web.',
  },
  {
    id: 'x', label: 'X', purpose: 'Preparar texto, vídeo e link para revisão e publicação.',
    portalUrl: 'https://developer.x.com/en/portal/dashboard', cost: 'Manual: zero · API: paga por chamada',
    requirement: 'No modo de custo zero, a Kairos exporta o pacote e abre o compositor após aprovação.',
  },
]
