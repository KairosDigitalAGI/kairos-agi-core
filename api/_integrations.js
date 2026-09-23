// Lógica de api/integrations/status — extraída para módulo próprio ao
// consolidar as rotas de integrações em api/integrations/[...route].mjs
// (teto de 12 Serverless Functions do plano Hobby). Comportamento idêntico
// ao antigo api/integrations/status.mjs; só devolve booleanos de
// configuração, nunca segredo nem número de negócio — por isso não passa
// por checkAuth.
const definitions = [
  { id: 'instagram', mode: 'oauth', required: ['META_APP_ID', 'META_APP_SECRET', 'META_OAUTH_REDIRECT_URI'] },
  { id: 'youtube', mode: 'oauth', required: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_OAUTH_REDIRECT_URI'] },
  { id: 'x', mode: 'manual-free', required: [] },
]

export function readIntegrationStatus(env = process.env, now = new Date()) {
  const tokenStoreRequired = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'KAIROS_TOKEN_ENCRYPTION_KEY']
  return {
    checkedAt: now.toISOString(),
    tokenStoreConfigured: tokenStoreRequired.every(key => Boolean(env[key]?.trim())),
    providers: definitions.map(provider => {
      const missingConfiguration = provider.required.filter(key => !env[key]?.trim())
      return { id: provider.id, mode: provider.mode, oauthConfigured: provider.mode === 'manual-free' || missingConfiguration.length === 0, connected: false, missingConfiguration }
    }),
  }
}
