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

// Estado real da conexão do YouTube (command.integracoes_tokens). Nunca
// carrega token — só o que já é público (nome do canal, validade).
export type YoutubeConnectionStatus =
  | { connected: true; accountLabel: string | null; scope: string | null; expiresAt: string | null; atualizadoEm: string | null }
  | { connected: false; reason: string }
