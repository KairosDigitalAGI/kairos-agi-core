import test from 'node:test'
import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'
import { Readable } from 'node:stream'
import { encrypt } from '../api/_crypto.js'
import { verifyWebhookChallenge, readWebhookBody, parseSignedWebhook, normalizeInstagramEvents, receiveInstagramWebhook } from '../api/_instagramEngagement.js'
import handler, { config } from '../api/integrations/[provider]/[action].mjs'
import staticWebhook, { config as staticConfig } from '../api/integrations/instagram/webhook.mjs'
import { freeGreetingConfigured } from '../api/_providers/geminiFree.js'
import { subscribeInstagramWebhook } from '../api/_instagram.js'

const env = {
  META_APP_SECRET: 'secret-for-test', META_WEBHOOK_VERIFY_TOKEN: 'verify-for-test',
  SUPABASE_URL: 'https://example.test', SUPABASE_SERVICE_ROLE_KEY: 'service-test',
  KAIROS_TOKEN_ENCRYPTION_KEY: 'cipher-test',
}

async function withEnv(fn) {
  const keys = [...Object.keys(env), 'KAIROS_IG_FREE_LLM_ENABLED', 'KAIROS_GEMINI_FREE_TIER_CONFIRMED', 'KAIROS_GEMINI_FREE_API_KEY', 'KAIROS_IG_FOUNDER_TEST_SENDER_ID',
    'KAIROS_IG_COMMENT_DM_ENABLED', 'KAIROS_WHATSAPP_URL', 'OPENROUTER_API_KEY', 'KAIROS_IG_COMMENT_DM_FALLBACK']
  const saved = Object.fromEntries(keys.map(key => [key, process.env[key]]))
  for (const key of keys) delete process.env[key]
  Object.assign(process.env, env)
  try { await fn() } finally {
    for (const key of keys) {
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

test('webhook fails closed when the signing secret is absent', () => {
  const previous = process.env.META_APP_SECRET
  delete process.env.META_APP_SECRET
  try {
    assert.throws(() => parseSignedWebhook(Buffer.from('{"object":"instagram","entry":[]}'), ''), /META_APP_SECRET ausente/)
  } finally {
    if (previous === undefined) delete process.env.META_APP_SECRET
    else process.env.META_APP_SECRET = previous
  }
})

test('raw body is read from the stream without triggering Vercel parsed-body getter', async () => {
  const request = Readable.from([Buffer.from('{"object":"instagram"}')])
  Object.defineProperty(request, 'body', { get() { throw new Error('parsed-body getter must not run') } })
  assert.equal((await readWebhookBody(request)).toString(), '{"object":"instagram"}')
})

test('account webhook subscription keeps token out of URL and requires Meta success', async () => {
  const previousFetch = globalThis.fetch
  try {
    globalThis.fetch = async (url, options) => {
      assert.match(String(url), /subscribed_fields=comments%2Cmessages/)
      assert.doesNotMatch(String(url), /secret-token/)
      assert.equal(options.headers.Authorization, 'Bearer secret-token')
      return new Response('{"success":true}', { status: 200 })
    }
    assert.deepEqual(await subscribeInstagramWebhook('secret-token', 'ig-1'), { subscribed: true })
    globalThis.fetch = async () => new Response('{"success":false}', { status: 200 })
    await assert.rejects(subscribeInstagramWebhook('secret-token', 'ig-1'), /Falha ao inscrever/)
  } finally { globalThis.fetch = previousFetch }
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

test('Founder greeting uses only a confirmed free-tier LLM and exact sender ID for Direct and comment', async () => {
  const previousFetch = globalThis.fetch
  const calls = []
  const token = encryptWithEnv()
  globalThis.fetch = async (url, options = {}) => {
    const href = String(url)
    const method = options.method || 'GET'
    calls.push({ href, method, body: options.body })
    if (href.includes('/rest/v1/integracoes_tokens')) return new Response(JSON.stringify(href.includes('access_token_enc') ? [{ account_id: 'ig-1', access_token_enc: token, expires_at: new Date(Date.now() + 40 * 86400000).toISOString() }] : [{ account_id: 'ig-1' }]), { status: 200 })
    if (href.includes('/rest/v1/instagram_automation_rules')) return new Response('[]', { status: 200 })
    if (href.includes('/rest/v1/instagram_engagement_events')) return new Response('[{}]', { status: method === 'POST' ? 201 : 200 })
    if (href.includes('/rest/v1/instagram_engagement_cooldowns')) return new Response('[{}]', { status: 201 })
    if (href.includes('generativelanguage.googleapis.com')) {
      assert.equal(options.headers['x-goog-api-key'], 'free-key-test')
      assert.doesNotMatch(options.body, /founder-1/)
      return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: 'Oi! Sou o KAIROS, como posso ajudar?' }] } }] }), { status: 200 })
    }
    if (href === 'https://graph.instagram.com/ig-1/messages') return new Response('{"message_id":"dm-1"}', { status: 200 })
    if (href === 'https://graph.instagram.com/comment-1/replies') return new Response('{"id":"reply-1"}', { status: 200 })
    throw new Error(`${method} ${href}`)
  }
  try {
    await withEnv(async () => {
      assert.equal(freeGreetingConfigured(), false)
      process.env.KAIROS_IG_FREE_LLM_ENABLED = 'true'
      process.env.KAIROS_GEMINI_FREE_TIER_CONFIRMED = 'true'
      process.env.KAIROS_GEMINI_FREE_API_KEY = 'free-key-test'
      process.env.KAIROS_IG_FOUNDER_TEST_SENDER_ID = 'founder-1'
      const payload = { object: 'instagram', entry: [{ id: 'ig-1', time: Math.floor(Date.now() / 1000),
        changes: [
          { field: 'comments', value: { id: 'comment-1', text: 'Oi!', from: { id: 'founder-1', username: 'founder' } } },
          { field: 'comments', value: { id: 'comment-2', text: 'Oi', from: { id: 'other-user', username: 'other' } } },
        ],
        messaging: [
          { sender: { id: 'founder-1' }, recipient: { id: 'ig-1' }, timestamp: Date.now(), message: { mid: 'dm-1', text: 'oi' } },
          { sender: { id: 'other-user' }, recipient: { id: 'ig-1' }, timestamp: Date.now(), message: { mid: 'dm-2', text: 'oi' } },
        ],
      }] }
      assert.equal((await receiveInstagramWebhook(payload)).received, 4)
    })
    assert.equal(calls.filter(call => call.href.includes('generativelanguage.googleapis.com')).length, 2)
    assert.equal(calls.filter(call => call.href === 'https://graph.instagram.com/ig-1/messages').length, 1)
    assert.equal(calls.filter(call => call.href === 'https://graph.instagram.com/comment-1/replies').length, 1)
  } finally { globalThis.fetch = previousFetch }
})

function commentDmFetch({ token, llmText, calls, saved }) {
  return async (url, options = {}) => {
    const href = String(url)
    const method = options.method || 'GET'
    calls.push({ href, method, body: options.body, headers: options.headers })
    if (href.includes('/rest/v1/integracoes_tokens')) return new Response(JSON.stringify(href.includes('access_token_enc') ? [{ account_id: 'ig-1', access_token_enc: token, expires_at: new Date(Date.now() + 40 * 86400000).toISOString() }] : [{ account_id: 'ig-1' }]), { status: 200 })
    if (href.includes('/rest/v1/instagram_automation_rules')) return new Response(JSON.stringify([{ id: 'rule-k', kind: 'comment', keyword: 'kairos', response_text: 'Te chamei no Direct! 🚀', enabled: true, approved_at: '2026-09-25T00:00:00Z' }]), { status: 200 })
    if (href.includes('/rest/v1/instagram_engagement_events') && method === 'POST') {
      const key = JSON.parse(options.body).event_key
      if (saved.has(key)) return new Response('{"code":"23505"}', { status: 409 })
      saved.add(key)
      return new Response('[{}]', { status: 201 })
    }
    if (href.includes('/rest/v1/instagram_engagement_cooldowns')) return new Response('[{}]', { status: 201 })
    if (href.includes('/rest/v1/instagram_engagement_events') && method === 'PATCH') return new Response('[{}]', { status: 200 })
    if (href === 'https://openrouter.ai/api/v1/chat/completions') return new Response(JSON.stringify({ choices: [{ message: { content: llmText } }] }), { status: 200 })
    if (href === 'https://graph.instagram.com/c-9/replies') return new Response('{"id":"reply-9"}', { status: 200 })
    if (href === 'https://graph.instagram.com/ig-1/messages') return new Response('{"message_id":"dm-9"}', { status: 200 })
    throw new Error(`${method} ${href}`)
  }
}

const kairosComment = { object: 'instagram', entry: [{ id: 'ig-1', time: Math.floor(Date.now() / 1000),
  changes: [{ field: 'comments', value: { id: 'c-9', text: 'KAIROS!!', from: { id: 'fan-1', username: 'fan' }, media: { id: 'reel-1' } } }] }] }

test('KAIROS comment gets the approved public reply plus one OpenRouter Private Reply with the configured link', async () => {
  const previousFetch = globalThis.fetch
  const calls = []
  globalThis.fetch = commentDmFetch({ token: encryptWithEnv(), llmText: 'Valeu pelo comentário! Eu sou o Kairos e atendo seus clientes no WhatsApp 24h. Bora ver como fica no seu negócio?', calls, saved: new Set() })
  try {
    await withEnv(async () => {
      process.env.KAIROS_IG_COMMENT_DM_ENABLED = 'true'
      process.env.OPENROUTER_API_KEY = 'or-test'
      process.env.KAIROS_WHATSAPP_URL = 'https://wa.me/5562999999999'
      assert.equal((await receiveInstagramWebhook(kairosComment)).received, 1)
      assert.equal((await receiveInstagramWebhook(kairosComment)).received, 0)
    })
    assert.equal(calls.filter(c => c.href === 'https://graph.instagram.com/c-9/replies').length, 1)
    const dms = calls.filter(c => c.href === 'https://graph.instagram.com/ig-1/messages')
    assert.equal(dms.length, 1)
    const body = JSON.parse(dms[0].body)
    assert.deepEqual(body.recipient, { comment_id: 'c-9' })
    assert.match(body.message.text, /^Valeu pelo comentário!/)
    assert.match(body.message.text, /https:\/\/wa\.me\/5562999999999$/)
    const llm = calls.find(c => c.href.includes('openrouter.ai'))
    assert.equal(llm.headers.Authorization, 'Bearer or-test')
  } finally { globalThis.fetch = previousFetch }
})

test('LLM text with links or prices falls back to the fixed Direct message', async () => {
  const previousFetch = globalThis.fetch
  const calls = []
  globalThis.fetch = commentDmFetch({ token: encryptWithEnv(), llmText: 'Plano por R$ 320 em https://site.falso', calls, saved: new Set() })
  try {
    await withEnv(async () => {
      process.env.KAIROS_IG_COMMENT_DM_ENABLED = 'true'
      process.env.OPENROUTER_API_KEY = 'or-test'
      await receiveInstagramWebhook(kairosComment)
    })
    const text = JSON.parse(calls.find(c => c.href === 'https://graph.instagram.com/ig-1/messages').body).message.text
    assert.match(text, /^Oi! Aqui é o Kairos/)
    assert.doesNotMatch(text, /site\.falso|R\$/)
  } finally { globalThis.fetch = previousFetch }
})

test('Private Reply stays off unless explicitly enabled', async () => {
  const previousFetch = globalThis.fetch
  const calls = []
  globalThis.fetch = commentDmFetch({ token: encryptWithEnv(), llmText: 'x', calls, saved: new Set() })
  try {
    await withEnv(async () => { await receiveInstagramWebhook(kairosComment) })
    assert.equal(calls.filter(c => c.href === 'https://graph.instagram.com/c-9/replies').length, 1)
    assert.equal(calls.filter(c => c.href === 'https://graph.instagram.com/ig-1/messages').length, 0)
    assert.equal(calls.filter(c => c.href.includes('openrouter.ai')).length, 0)
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
