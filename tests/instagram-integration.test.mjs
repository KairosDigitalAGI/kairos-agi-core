import test from 'node:test'
import assert from 'node:assert/strict'
import { decrypt, verifyState } from '../api/_crypto.js'
import { buildInstagramConnectUrl, completeInstagramConnection, computeInstagramStatus, disconnectInstagram } from '../api/_instagram.js'

const KEYS = ['KAIROS_TOKEN_ENCRYPTION_KEY', 'META_APP_ID', 'META_APP_SECRET', 'META_OAUTH_REDIRECT_URI', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']

function withEnv(vars, fn) {
  const saved = Object.fromEntries(KEYS.map(key => [key, process.env[key]]))
  for (const key of KEYS) delete process.env[key]
  Object.assign(process.env, vars)
  return Promise.resolve().then(fn).finally(() => {
    for (const key of KEYS) delete process.env[key]
    for (const [key, value] of Object.entries(saved)) if (value !== undefined) process.env[key] = value
  })
}

const oauthEnv = {
  KAIROS_TOKEN_ENCRYPTION_KEY: 'chave-instagram-de-teste',
  META_APP_ID: 'meta-app-id',
  META_APP_SECRET: 'meta-app-secret',
  META_OAUTH_REDIRECT_URI: 'https://kairos-agi-core.vercel.app/api/integrations/instagram/callback',
}

test('Instagram connect URL uses professional scopes and signed provider state', async () => {
  await withEnv(oauthEnv, () => {
    const url = new URL(buildInstagramConnectUrl())
    assert.equal(url.origin + url.pathname, 'https://www.instagram.com/oauth/authorize')
    assert.equal(url.searchParams.get('client_id'), 'meta-app-id')
    assert.match(url.searchParams.get('scope'), /instagram_business_basic/)
    assert.match(url.searchParams.get('scope'), /instagram_business_content_publish/)
    assert.equal(verifyState(url.searchParams.get('state')).p, 'instagram')
  })
})

test('Instagram connect fails closed when app configuration is absent', async () => {
  await withEnv({}, () => assert.throws(() => buildInstagramConnectUrl(), /META_APP_ID.*META_APP_SECRET.*META_OAUTH_REDIRECT_URI/s))
})

test('Instagram rejects unsigned state before network or storage', async () => {
  await withEnv(oauthEnv, async () => {
    await assert.rejects(completeInstagramConnection({ code: 'code', state: 'forged' }), /expirou|não veio deste painel/)
  })
})

test('Instagram validates the professional profile and stores only encrypted token', async () => {
  const originalFetch = globalThis.fetch
  let stored
  try {
    await withEnv({ ...oauthEnv, SUPABASE_URL: 'https://example.test', SUPABASE_SERVICE_ROLE_KEY: 'service-role' }, async () => {
      const state = buildInstagramConnectUrl().match(/[?&]state=([^&]+)/)[1]
      globalThis.fetch = async (url, options = {}) => {
        const href = String(url)
        if (href === 'https://api.instagram.com/oauth/access_token') return new Response(JSON.stringify({ access_token: 'short-token', user_id: 123 }), { status: 200 })
        if (href.startsWith('https://graph.instagram.com/access_token')) return new Response(JSON.stringify({ access_token: 'long-token', token_type: 'bearer', expires_in: 5184000 }), { status: 200 })
        if (href.startsWith('https://graph.instagram.com/me')) return new Response(JSON.stringify({ id: 'ig-123', username: '_kairosdigital_', account_type: 'BUSINESS' }), { status: 200 })
        if (href.includes('/rest/v1/integracoes_tokens')) {
          stored = JSON.parse(options.body)
          return new Response(JSON.stringify([stored]), { status: 201 })
        }
        throw new Error(`fetch inesperado: ${href}`)
      }
      const result = await completeInstagramConnection({ code: 'valid-code', state: decodeURIComponent(state) })
      assert.equal(result.accountLabel, '@_kairosdigital_')
      assert.equal(stored.provider, 'instagram')
      assert.equal(stored.account_id, 'ig-123')
      assert.equal(decrypt(stored.access_token_enc), 'long-token')
      assert.equal(JSON.stringify(stored).includes('long-token'), false)
    })
  } finally { globalThis.fetch = originalFetch }
})

test('Instagram status builds a clickable profile URL from the @username label, and omits it when the label is a display name instead', async () => {
  const originalFetch = globalThis.fetch
  try {
    await withEnv({ SUPABASE_URL: 'https://example.test', SUPABASE_SERVICE_ROLE_KEY: 'x' }, async () => {
      globalThis.fetch = async () => new Response(JSON.stringify([{ account_label: '@_kairosdigital_', scope: 'x', expires_at: null, atualizado_em: null }]), { status: 200 })
      const withUsername = await computeInstagramStatus()
      assert.equal(withUsername.connected, true)
      assert.equal(withUsername.profileUrl, 'https://www.instagram.com/_kairosdigital_/')

      globalThis.fetch = async () => new Response(JSON.stringify([{ account_label: 'Kairos Digital', scope: 'x', expires_at: null, atualizado_em: null }]), { status: 200 })
      const withoutUsername = await computeInstagramStatus()
      assert.equal(withoutUsername.connected, true)
      assert.equal(withoutUsername.profileUrl, null)
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('Instagram status and disconnect fail closed without Supabase', async () => {
  await withEnv({}, async () => {
    const status = await computeInstagramStatus()
    assert.equal(status.connected, false)
    assert.match(status.reason, /SUPABASE_URL/)
    await assert.rejects(disconnectInstagram(), /SUPABASE_URL/)
  })
})
