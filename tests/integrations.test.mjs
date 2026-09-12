import test from 'node:test'
import assert from 'node:assert/strict'
import { readIntegrationStatus } from '../api/integrations/status.mjs'

test('integration status exposes configuration names without leaking values', () => {
  const secret = 'do-not-leak'
  const status = readIntegrationStatus({ META_APP_ID: secret, META_APP_SECRET: secret }, new Date('2026-09-11T12:00:00Z'))
  assert.equal(status.providers.find(item => item.id === 'instagram').oauthConfigured, true)
  assert.equal(status.providers.find(item => item.id === 'youtube').oauthConfigured, false)
  assert.equal(status.providers.find(item => item.id === 'x').mode, 'manual-free')
  assert.equal(status.tokenStoreConfigured, false)
  assert.equal(JSON.stringify(status).includes(secret), false)
})

test('token store requires all server-side settings', () => {
  const env = { SUPABASE_URL: 'url', SUPABASE_SERVICE_ROLE_KEY: 'role', KAIROS_TOKEN_ENCRYPTION_KEY: 'key' }
  assert.equal(readIntegrationStatus(env).tokenStoreConfigured, true)
})
