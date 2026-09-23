import test from 'node:test'
import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'
import {
  verifyWebhookChallenge,
  verifyWebhookSignature,
  parseMessagingEvents,
  parseCommentEvents,
  getAutoReplyEnabled,
  setAutoReplyEnabled,
  generateSuggestedReply,
  handleWebhookPayload,
} from '../api/_instagram_webhook.js'
import webhookHandler from '../api/integrations/instagram-webhook.mjs'

const KEYS = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'META_APP_SECRET', 'META_WEBHOOK_VERIFY_TOKEN', 'OPENROUTER_API_KEY']

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

const baseEnv = { SUPABASE_URL: 'https://example.test', SUPABASE_SERVICE_ROLE_KEY: 'x', META_APP_SECRET: 'app-secret-de-teste', META_WEBHOOK_VERIFY_TOKEN: 'meatyhamhock' }

// Exemplo oficial da doc do Messenger Platform para Instagram (developers.facebook.com/docs/messenger-platform/instagram/features/webhook)
const MENSAGEM_EXEMPLO_DOC = {
  object: 'instagram',
  entry: [
    {
      id: 'IGID',
      time: 1569262486134,
      messaging: [
        {
          sender: { id: 'IGSID' },
          recipient: { id: 'IGID' },
          timestamp: 1569262485349,
          message: { mid: 'MESSAGE-ID', text: 'MESSAGE-TEXT' },
        },
      ],
    },
  ],
}

// Reconstruído a partir do esquema de campos documentado em
// developers.facebook.com/docs/graph-api/webhooks/reference/instagram
// (field="comments"), não um payload literal quotado pela Meta.
const COMENTARIO_EXEMPLO_DOC = {
  object: 'instagram',
  entry: [
    {
      id: 'IGID',
      time: 1234567890,
      changes: [
        {
          field: 'comments',
          value: {
            id: 'COMMENT-ID',
            text: 'Adorei esse reel!',
            from: { id: 'COMMENTER-ID', username: 'seguidor_x' },
            media: { id: 'MEDIA-ID', media_product_type: 'REELS' },
          },
        },
      ],
    },
  ],
}

// --- verifyWebhookChallenge (GET, handshake) -------------------------------

test('verifyWebhookChallenge fails closed (503) without META_WEBHOOK_VERIFY_TOKEN', async () => {
  await withEnv({}, async () => {
    assert.throws(() => verifyWebhookChallenge({ mode: 'subscribe', token: 'x', challenge: '123' }), /META_WEBHOOK_VERIFY_TOKEN/)
  })
})

test('verifyWebhookChallenge rejects (403) a token that does not match', async () => {
  await withEnv(baseEnv, async () => {
    assert.throws(() => verifyWebhookChallenge({ mode: 'subscribe', token: 'errado', challenge: '123' }))
  })
})

test('verifyWebhookChallenge echoes back hub.challenge exactly (Meta doc example) when mode/token match', async () => {
  await withEnv(baseEnv, async () => {
    const out = verifyWebhookChallenge({ mode: 'subscribe', token: 'meatyhamhock', challenge: '1158201444' })
    assert.equal(out, '1158201444')
  })
})

// --- verifyWebhookSignature (POST, corpo bruto) ----------------------------

test('verifyWebhookSignature fails closed (503) without META_APP_SECRET', async () => {
  await withEnv({}, async () => {
    assert.throws(() => verifyWebhookSignature('{}', 'sha256=x'), /META_APP_SECRET/)
  })
})

test('verifyWebhookSignature rejects (401) a missing or malformed header', async () => {
  await withEnv(baseEnv, async () => {
    assert.throws(() => verifyWebhookSignature('{}', undefined), /X-Hub-Signature-256/)
    assert.throws(() => verifyWebhookSignature('{}', 'not-sha256-prefixed'), /X-Hub-Signature-256/)
  })
})

test('verifyWebhookSignature rejects (401) a signature that does not match the raw body', async () => {
  await withEnv(baseEnv, async () => {
    assert.throws(() => verifyWebhookSignature('{"a":1}', 'sha256=00112233'), /não confere/)
  })
})

test('verifyWebhookSignature accepts a correctly computed HMAC-SHA256 of the exact raw body', async () => {
  await withEnv(baseEnv, async () => {
    const rawBody = JSON.stringify(MENSAGEM_EXEMPLO_DOC)
    const assinatura = 'sha256=' + createHmac('sha256', baseEnv.META_APP_SECRET).update(rawBody, 'utf8').digest('hex')
    assert.doesNotThrow(() => verifyWebhookSignature(rawBody, assinatura))
  })
})

// --- Parsing (payloads reais/documentados) ---------------------------------

test('parseMessagingEvents extracts sender/text/mid from the official doc example payload', () => {
  const eventos = parseMessagingEvents(MENSAGEM_EXEMPLO_DOC)
  assert.equal(eventos.length, 1)
  assert.deepEqual(eventos[0], { tipo: 'mensagem', remetenteId: 'IGSID', remetenteUsername: null, conteudo: 'MESSAGE-TEXT', referenciaExterna: 'MESSAGE-ID' })
})

test('parseMessagingEvents ignores echoes of messages this account itself sent', () => {
  const payload = { entry: [{ messaging: [{ sender: { id: 'IGID' }, message: { mid: 'x', text: 'oi', is_echo: true } }] }] }
  assert.equal(parseMessagingEvents(payload).length, 0)
})

test('parseCommentEvents extracts commenter id/username/text/comment id from the documented comments field schema', () => {
  const eventos = parseCommentEvents(COMENTARIO_EXEMPLO_DOC)
  assert.equal(eventos.length, 1)
  assert.deepEqual(eventos[0], { tipo: 'comentario', remetenteId: 'COMMENTER-ID', remetenteUsername: 'seguidor_x', conteudo: 'Adorei esse reel!', referenciaExterna: 'COMMENT-ID' })
})

test('parseMessagingEvents/parseCommentEvents never throw on an empty or malformed payload', () => {
  assert.deepEqual(parseMessagingEvents({}), [])
  assert.deepEqual(parseCommentEvents(null), [])
})

// --- Interruptor (toggle OFF por padrão) ------------------------------------

test('getAutoReplyEnabled defaults to false (never presumes on) without Supabase configured', async () => {
  await withEnv({}, async () => {
    const { enabled, source } = await getAutoReplyEnabled('instagram')
    assert.equal(enabled, false)
    assert.equal(source, 'unavailable')
  })
})

test('getAutoReplyEnabled defaults to false when the migration has not been applied yet', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => new Response('relation does not exist', { status: 404 })
  try {
    await withEnv(baseEnv, async () => {
      const { enabled, reason } = await getAutoReplyEnabled('instagram')
      assert.equal(enabled, false)
      assert.match(reason, /migration 0026/)
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('getAutoReplyEnabled reads the real stored value once configured', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => new Response(JSON.stringify([{ auto_reply_enabled: true }]), { status: 200 })
  try {
    await withEnv(baseEnv, async () => {
      const { enabled, source } = await getAutoReplyEnabled('instagram')
      assert.equal(enabled, true)
      assert.equal(source, 'real')
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('setAutoReplyEnabled fails closed (503) without Supabase configured', async () => {
  await withEnv({}, async () => {
    await assert.rejects(setAutoReplyEnabled({ provider: 'instagram', enabled: true }), /SUPABASE_URL/)
  })
})

// --- Rascunho de resposta por IA (nunca enviado) ----------------------------

test('generateSuggestedReply fails closed (503) without OPENROUTER_API_KEY', async () => {
  await withEnv(baseEnv, async () => {
    await assert.rejects(generateSuggestedReply('oi'), /OPENROUTER_API_KEY/)
  })
})

test('generateSuggestedReply returns the drafted text and the prompt version, via mocked OpenRouter', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => new Response(JSON.stringify({ model: 'mistralai/mistral-small-3.2-24b-instruct:free', choices: [{ message: { content: 'Obrigado pela mensagem!' } }] }), { status: 200 })
  try {
    await withEnv({ ...baseEnv, OPENROUTER_API_KEY: 'k' }, async () => {
      const rascunho = await generateSuggestedReply('Vocês fazem entrega em SP?')
      assert.equal(rascunho.text, 'Obrigado pela mensagem!')
      assert.equal(rascunho.promptVersion, 'v1')
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})

// --- Orquestração completa (handleWebhookPayload) ---------------------------

test('handleWebhookPayload logs the doc-example message without drafting a reply when auto-reply is off (default)', async () => {
  const chamadas = []
  const originalFetch = globalThis.fetch
  globalThis.fetch = async (input, opts) => {
    const href = String(input)
    chamadas.push({ href, method: opts?.method || 'GET' })
    if (href.includes('rest/v1/integration_settings')) return new Response('[]', { status: 200 })
    if (href.includes('rest/v1/instagram_webhook_events') && opts?.method === 'POST') return new Response('[{}]', { status: 201 })
    throw new Error(`fetch inesperado neste teste: ${opts?.method || 'GET'} ${href}`)
  }
  try {
    await withEnv(baseEnv, async () => {
      const resultado = await handleWebhookPayload(MENSAGEM_EXEMPLO_DOC)
      assert.deepEqual(resultado, { received: 1, logged: 1, failed: 0, autoReplyEnabled: false })
    })
  } finally {
    globalThis.fetch = originalFetch
  }
  // Nunca chama nenhum endpoint de envio real da Meta (graph.instagram.com) — só Supabase.
  assert.ok(chamadas.every((c) => c.href.includes('example.test')))
})

test('handleWebhookPayload drafts and logs a suggested reply when auto-reply is on, but never marks it as sent', async () => {
  const escritas = []
  const originalFetch = globalThis.fetch
  globalThis.fetch = async (input, opts) => {
    const href = String(input)
    if (href.includes('rest/v1/integration_settings')) return new Response(JSON.stringify([{ auto_reply_enabled: true }]), { status: 200 })
    if (href.includes('openrouter.ai')) return new Response(JSON.stringify({ model: 'm', choices: [{ message: { content: 'Rascunho automático.' } }] }), { status: 200 })
    if (href.includes('rest/v1/instagram_webhook_events') && opts?.method === 'POST') {
      const corpo = JSON.parse(opts.body)
      escritas.push(corpo)
      return new Response(JSON.stringify([corpo]), { status: 201 })
    }
    throw new Error(`fetch inesperado neste teste: ${opts?.method || 'GET'} ${href}`)
  }
  try {
    await withEnv({ ...baseEnv, OPENROUTER_API_KEY: 'k' }, async () => {
      const resultado = await handleWebhookPayload(COMENTARIO_EXEMPLO_DOC)
      assert.deepEqual(resultado, { received: 1, logged: 1, failed: 0, autoReplyEnabled: true })
    })
  } finally {
    globalThis.fetch = originalFetch
  }
  assert.equal(escritas.length, 1)
  assert.equal(escritas[0].resposta_sugerida, 'Rascunho automático.')
  assert.equal(escritas[0].tipo, 'comentario')
})

// --- Rota física (Web Standard fetch handler, verificação de assinatura real) ---

test('GET instagram-webhook route echoes hub.challenge on a valid handshake', async () => {
  await withEnv(baseEnv, async () => {
    const request = new Request('https://example.test/api/integrations/instagram-webhook?hub.mode=subscribe&hub.verify_token=meatyhamhock&hub.challenge=1158201444')
    const response = await webhookHandler.fetch(request)
    assert.equal(response.status, 200)
    assert.equal(await response.text(), '1158201444')
  })
})

test('POST instagram-webhook route rejects a payload whose signature does not match the raw body', async () => {
  await withEnv(baseEnv, async () => {
    const rawBody = JSON.stringify(MENSAGEM_EXEMPLO_DOC)
    const request = new Request('https://example.test/api/integrations/instagram-webhook', {
      method: 'POST',
      headers: { 'x-hub-signature-256': 'sha256=00112233', 'content-type': 'application/json' },
      body: rawBody,
    })
    const response = await webhookHandler.fetch(request)
    assert.equal(response.status, 401)
  })
})

test('POST instagram-webhook route accepts a correctly signed payload and processes it end-to-end', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async (input, opts) => {
    const href = String(input)
    if (href.includes('rest/v1/integration_settings')) return new Response('[]', { status: 200 })
    if (href.includes('rest/v1/instagram_webhook_events') && opts?.method === 'POST') return new Response('[{}]', { status: 201 })
    throw new Error(`fetch inesperado neste teste: ${opts?.method || 'GET'} ${href}`)
  }
  try {
    await withEnv(baseEnv, async () => {
      const rawBody = JSON.stringify(MENSAGEM_EXEMPLO_DOC)
      const assinatura = 'sha256=' + createHmac('sha256', baseEnv.META_APP_SECRET).update(rawBody, 'utf8').digest('hex')
      const request = new Request('https://example.test/api/integrations/instagram-webhook', {
        method: 'POST',
        headers: { 'x-hub-signature-256': assinatura, 'content-type': 'application/json' },
        body: rawBody,
      })
      const response = await webhookHandler.fetch(request)
      assert.equal(response.status, 200)
      const body = await response.json()
      assert.equal(body.logged, 1)
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})
