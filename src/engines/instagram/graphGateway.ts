import type { ContentItem } from '../../types/instagram'
/** Boundary for a future server adapter. No URLs, credentials or network calls in this implementation. */
export interface InstagramGateway {
  readonly connected: boolean
  publish(content: ContentItem): Promise<{ externalId: string }>
}
export const disconnectedGateway: InstagramGateway = {
  connected: false,
  async publish() { throw new Error('Instagram Graph API não conectada. Nenhum conteúdo foi publicado.') },
}
