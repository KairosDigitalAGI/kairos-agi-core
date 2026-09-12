export type IntegrationProviderId = 'instagram' | 'youtube' | 'x'

export interface IntegrationProviderStatus {
  id: IntegrationProviderId
  oauthConfigured: boolean
  connected: boolean
  mode: 'oauth' | 'manual-free'
  missingConfiguration: string[]
}

export interface IntegrationStatusResponse {
  checkedAt: string
  tokenStoreConfigured: boolean
  providers: IntegrationProviderStatus[]
}
