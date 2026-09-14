import test from 'node:test'
import assert from 'node:assert/strict'
import { encrypt, decrypt, signState, verifyState } from '../api/_crypto.js'
import { buildConnectUrl, computeYoutubeStatus, completeConnection, disconnectYoutube } from '../api/_youtube.js'

const KEYS = ['KAIROS_TOKEN_ENCRYPTION_KEY', 'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_OAUTH_REDIRECT_URI', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']

function withEnv(vars, fn) {
  const saved = Object.fromEntries(KEYS.map((k) => [k, process.env[k]]))
  for (const k of KEYS) delete process.env[k]
  Object.assign(process.env, vars)
  return Promise.resolve()
    .then(fn)
    .finally(() => {
      for (const k of KEYS) delete process.env[k]
      for (const [k, v] of Object.entries(saved)) if (v !== undefined) process.env[k] = v
    })
}

// --- api/_crypto.js -----------------------------------------------------

test('encrypt/decrypt round-trips a token and fails closed without the key', async () => {
  await withEnv({ KAIROS_TOKEN_ENCRYPTION_KEY: 'chave-de-teste-bem-longa' }, () => {
    const ciphertext = encrypt('ya29.a0-access-token-real')
    assert.notEqual(ciphertext, 'ya29.a0-access-token-real')
    assert.equal(decrypt(ciphertext), 'ya29.a0-access-token-real')
  })
  await withEnv({}, () => {
    assert.throws(() => encrypt('x'), /KAIROS_TOKEN_ENCRYPTION_KEY/)
  })
})

test('decrypt rejects ciphertext produced under a different key (no silent corruption)', async () => {
  let ciphertext
  await withEnv({ KAIROS_TOKEN_ENCRYPTION_KEY: 'chave-a' }, () => {
    ciphertext = encrypt('segredo')
  })
  await withEnv({ KAIROS_TOKEN_ENCRYPTION_KEY: 'chave-b' }, () => {
    assert.throws(() => decrypt(ciphertext))
  })
})

test('signState/verifyState round-trips and rejects tampering or expiry', async () => {
  await withEnv({ KAIROS_TOKEN_ENCRYPTION_KEY: 'chave-de-teste-bem-longa' }, () => {
    const state = signState({ p: 'youtube' })
    const payload = verifyState(state)
    assert.equal(payload.p, 'youtube')

    assert.equal(verifyState(`${state}x`), null)
    assert.equal(verifyState('lixo-sem-ponto'), null)

    // Corpo trocado (provider diferente) reaproveitando a assinatura original: o HMAC não bate.
    const [, mac] = state.split('.')
    const forged = Buffer.from(JSON.stringify({ p: 'instagram', iat: Date.now() }), 'utf8').toString('base64url')
    assert.equal(verifyState(`${forged}.${mac}`), null)
  })
})

test('verifyState rejects a state older than the freshness window', async () => {
  await withEnv({ KAIROS_TOKEN_ENCRYPTION_KEY: 'chave-de-teste-bem-longa' }, () => {
    const state = signState({ p: 'youtube' })
    const originalNow = Date.now
    Date.now = () => originalNow() + 11 * 60 * 1000
    try {
      assert.equal(verifyState(state), null)
    } finally {
      Date.now = originalNow
    }
  })
})

// --- api/_youtube.js ------------------------------------------------------

test('buildConnectUrl fails closed with the exact missing env vars when the OAuth client is incomplete', async () => {
  await withEnv({}, () => {
    assert.throws(() => buildConnectUrl(), /GOOGLE_CLIENT_ID.*GOOGLE_CLIENT_SECRET.*GOOGLE_OAUTH_REDIRECT_URI/s)
  })
})

test('buildConnectUrl points at Google with a signed state once the client is configured', async () => {
  await withEnv(
    { KAIROS_TOKEN_ENCRYPTION_KEY: 'chave-de-teste-bem-longa', GOOGLE_CLIENT_ID: 'id', GOOGLE_CLIENT_SECRET: 'segredo', GOOGLE_OAUTH_REDIRECT_URI: 'https://kairos-agi-core.vercel.app/api/integrations/youtube/callback' },
    () => {
      const url = new URL(buildConnectUrl())
      assert.equal(url.origin + url.pathname, 'https://accounts.google.com/o/oauth2/v2/auth')
      assert.equal(url.searchParams.get('client_id'), 'id')
      assert.ok(url.searchParams.get('state'))
      assert.equal(verifyState(url.searchParams.get('state')).p, 'youtube')
    },
  )
})

test('computeYoutubeStatus reports disconnected (never fabricated) without Supabase configured', async () => {
  await withEnv({}, async () => {
    const out = await computeYoutubeStatus()
    assert.equal(out.connected, false)
    assert.match(out.reason, /SUPABASE_URL/)
  })
})

test('computeYoutubeStatus surfaces the pending-migration hint when the table does not exist yet', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => new Response('relation "command.integracoes_tokens" does not exist', { status: 404 })
  try {
    await withEnv({ SUPABASE_URL: 'https://example.test', SUPABASE_SERVICE_ROLE_KEY: 'x' }, async () => {
      const out = await computeYoutubeStatus()
      assert.equal(out.connected, false)
      assert.match(out.reason, /0021_integracoes_tokens\.sql/)
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('completeConnection rejects an unsigned or foreign state before ever touching Supabase', async () => {
  await withEnv({ KAIROS_TOKEN_ENCRYPTION_KEY: 'chave-de-teste-bem-longa' }, async () => {
    await assert.rejects(completeConnection({ code: 'abc', state: 'lixo' }), /expirou|não veio deste painel/)
  })
})

test('disconnectYoutube fails closed (503) without Supabase configured', async () => {
  await withEnv({}, async () => {
    await assert.rejects(disconnectYoutube(), /SUPABASE_URL/)
  })
})
