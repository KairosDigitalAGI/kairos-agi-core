import { computeSeedanceReadiness } from '../_content.js'

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

export default async function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store, max-age=0')
  const status = readIntegrationStatus()
  if (request.query?.scope === 'media') {
    try { status.media = { seedance: await computeSeedanceReadiness() } }
    catch { status.media = { seedance: null } }
  }
  response.status(200).json(status)
}
