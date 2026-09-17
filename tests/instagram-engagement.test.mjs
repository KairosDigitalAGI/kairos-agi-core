import test from 'node:test'
import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'
import { Readable } from 'node:stream'
import { encrypt } from '../api/_crypto.js'
import { verifyWebhookChallenge, readWebhookBody, parseSignedWebhook, normalizeInstagramEvents, receiveInstagramWebhook } from '../api/_instagramEngagement.js'
import handler, { config } from '../api/integrations/[provider]/[action].mjs'
import staticWebhook, { config as staticConfig } from '../api/integrations/instagram/webhook.mjs'

const env = {
  META_APP_SECRET: 'secret-for-test', META_WEBHOOK_VERIFY_TOKEN: 'verify-for-test',
  SUPABASE_URL: 'https://example.test', SUPABASE_SERVICE_ROLE_KEY: 'service-test',
  KAIROS_TOKEN_ENCRYPTION_KEY: 'cipher-test',
}

async function withEnv(fn) {
  const saved = Object.fromEntries(Object.keys(env).map(key => [key, process.env[key]]))
  Object.assign(process.env, env)
  try { await fn() } finally {
    for (const key of Object.keys(env)) {
      if (saved[key] === undefined) delete process.env[key]
      else process.env[key] = saved[key]
    }
  }
}

test('webhook challenge and HMAC reject wrong token, tampering and unknown object', async () => withEnv(() => {
  assert.equal(config.api.bodyParser, false)
  assert.equal(verifyWebhookChallenge({ 'hub.mode': 'subscribe', 'hub.verify_token': 'verify-for-test', 'hub.challenge': '12345' }), '12345')
  assert.throws(() => verifyWebhookChallenge({ 'hub.mode': 'subscribe', 'hub.verify_token': 'wrong' }), /recusada/)
  const raw = Buffer.from(JSON.stringify({ object: 'instagram', entry: [] }))
  const signature = `sha256=${createHmac('sha256', env.META_APP_SECRET).update(raw).digest('hex')}`
  assert.deepEqual(parseSignedWebhook(raw, signature), { object: 'instagram', entry: [] })
  assert.throws(() => parseSignedWebhook(Buffer.from(`${raw} `), signature), /Assinatura/)
  const other = Buffer.from(JSON.stringify({ object: 'page', entry: [] }))
  assert.throws(() => parseSignedWebhook(other, `sha256=${createHmac('sha256', env.META_APP_SECRET).update(other).digest('hex')}`), /inesperado/)
}))

test('public webhook route verifies the challenge and refuses unsigned POST before storage', async () => withEnv(async () => {
  const respond = () => ({ statusCode: 0, headers: {}, setHeader(name, value) { this.headers[name] = value },
    status(code) { this.statusCode = code; return this }, send(value) { this.body = value; return this }, json(value) { this.body = value; return this } })
  let res = respond()
  await handler({ method: 'GET', query: { provider: 'instagram', action: 'webhook', 'hub.mode': 'subscribe', 'hub.verify_token': env.META_WEBHOOK_VERIFY_TOKEN, 'hub.challenge': 'ok' } }, res)
  assert.equal(res.statusCode, 200)
  assert.equal(res.body, 'ok')
  res = respond()
  await handler({ method: 'POST', query: { provider: 'instagram', action: 'webhook' }, headers: {}, body: Buffer.from('{"object":"instagram","entry":[]}') }, res)
  assert.equal(res.statusCode, 403)
  assert.match(res.body.erro, /Assinatura/)

  assert.equal(staticConfig.api.bodyParser, false)
  res = respond()
  await staticWebhook({ method: 'GET', query: { 'hub.mode': 'subscribe', 'hub.verify_token': env.META_WEBHOOK_VERIFY_TOKEN, 'hub.challenge': 'static-ok' } }, res)
  assert.equal(res.statusCode, 200)
  assert.equal(res.body, 'static-ok')
}))

test('raw body is read from the stream without triggering Vercel parsed-body getter', async () => {
  const request = Readable.from([Buffer.from('{"object":"instagram"}')])
  Object.defineProperty(request, 'body', { get() { throw new Error('parsed-body getter must not run') } })
  assert.equal((await readWebhookBody(request)).toString(), '{"object":"instagram"}')
})

test('normalizer ignores echoes and non-text messages', () => {
  const events = normalizeInstagramEvents({ entry: [{ id: 'ig-1', time: 1789600000,
    changes: [{ field: 'comments', value: { id: 'c-1', text: 'Preço?', from: { id: 'user-1', username: 'pessoa' } } }],
    messaging: [
      { sender: { id: 'user-2' }, recipient: { id: 'ig-1' }, timestamp: Date.now(), message: { mid: 'm-1', text: 'Oi' } },
      { sender: { id: 'ig-1' }, recipient: { id: 'user-2' }, message: { mid: 'm-2', text: 'eco', is_echo: true } },
      { sender: { id: 'user-2' }, recipient: { id: 'ig-1' }, message: { mid: 'm-3', attachments: [] } },
    ],
  }] })
  assert.deepEqual(events.map(event => event.event_key), ['comment:c-1', 'message:m-1'])
  assert.equal(events[0].sender_username, 'pessoa')
})

test('approved keyword auto-replies once; duplicate webhook does not send twice', async () => {
  const previousFetch = globalThis.fetch
  const saved = new Set()
  const calls = []
  const token = encryptWithEnv()
  globalThis.fetch = async (url, options = {}) => {
    const href = String(url)
    const method = options.method || 'GET'
    calls.push({ href, method, body: options.body })
    if (href.includes('/rest/v1/integracoes_tokens')) return new Response(JSON.stringify(method === 'GET' && href.includes('access_token_enc') ? [{ account_id: 'ig-1', access_token_enc: token, expires_at: new Date(Date.now() + 40 * 86400000).toISOString() }] : [{ account_id: 'ig-1' }]), { status: 200 })
    if (href.includes('/rest/v1/instagram_automation_rules')) return new Response(JSON.stringify([{ id: 'rule-1', kind: 'message', keyword: 'orçamento', response_text: 'Olá! Conte qual serviço você procura.', enabled: true, approved_at: '2026-09-17T00:00:00Z' }]), { status: 200 })
    if (href.includes('/rest/v1/instagram_engagement_events') && method === 'POST') {
      const key = JSON.parse(options.body).event_key
      if (saved.has(key)) return new Response('{"code":"23505"}', { status: 409 })
      saved.add(key)
      return new Response('[{}]', { status: 201 })
    }
    if (href.includes('/rest/v1/instagram_engagement_cooldowns')) return new Response('[{}]', { status: 201 })
    if (href.includes('/rest/v1/instagram_engagement_events') && method === 'PATCH') return new Response('[{}]', { status: 200 })
    if (href === 'https://graph.instagram.com/ig-1/messages') return new Response(JSON.stringify({ message_id: 'sent-1' }), { status: 200 })
    throw new Error(`${method} ${href}`)
  }
  const payload = { object: 'instagram', entry: [{ id: 'ig-1', messaging: [{ sender: { id: 'user-1' }, recipient: { id: 'ig-1' }, timestamp: Date.now(), message: { mid: 'mid-1', text: 'Quero um orçamento' } }] }] }
  try {
    await withEnv(async () => {
      assert.equal((await receiveInstagramWebhook(payload)).received, 1)
      assert.equal((await receiveInstagramWebhook(payload)).received, 0)
    })
    assert.equal(calls.filter(call => call.href === 'https://graph.instagram.com/ig-1/messages').length, 1)
    const sent = calls.find(call => call.href === 'https://graph.instagram.com/ig-1/messages')
    assert.equal(JSON.parse(sent.body).recipient.id, 'user-1')
  } finally { globalThis.fetch = previousFetch }
})

function encryptWithEnv() {
  const previous = process.env.KAIROS_TOKEN_ENCRYPTION_KEY
  process.env.KAIROS_TOKEN_ENCRYPTION_KEY = env.KAIROS_TOKEN_ENCRYPTION_KEY
  try { return encrypt('token-test') } finally {
    if (previous === undefined) delete process.env.KAIROS_TOKEN_ENCRYPTION_KEY
    else process.env.KAIROS_TOKEN_ENCRYPTION_KEY = previous
  }
}
