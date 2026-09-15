import test from 'node:test'
import assert from 'node:assert/strict'
import { generateDailyNarrative, getAgentActivity } from '../api/_story.js'

const KEYS = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'ANTHROPIC_API_KEY', 'OPENAI_API_KEY', 'OPENROUTER_API_KEY', 'KAIROS_LLM_PROVIDER']

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

test('generateDailyNarrative reports unavailable (never narrating over invented numbers) without Supabase configured', async () => {
  await withEnv({}, async () => {
    const out = await generateDailyNarrative({})
    assert.equal(out.source, 'unavailable')
  })
})

test('generateDailyNarrative fails closed (503) without any paid LLM provider configured, even with Supabase reachable', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => new Response(JSON.stringify([]), { status: 200 })
  try {
    await withEnv({ SUPABASE_URL: 'https://example.test', SUPABASE_SERVICE_ROLE_KEY: 'x' }, async () => {
      await assert.rejects(generateDailyNarrative({}), /provider/)
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('generateDailyNarrative only ever sends the provider real numbers computed from Supabase, never a client-supplied metric', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async (url) => {
    const href = String(url)
    if (href.includes('/rest/v1/receitas')) return new Response(JSON.stringify([{ valor: 500, tipo: 'mensalidade' }]), { status: 200 })
    if (href.includes('/rest/v1/clientes')) return new Response(JSON.stringify([{ id: '1', ativo: true }]), { status: 200 })
    if (href.includes('/rest/v1/content_jobs')) return new Response(JSON.stringify([{ etapa: 'publicado' }, { etapa: 'video' }]), { status: 200 })
    throw new Error(`fetch inesperado: ${href}`)
  }
  const calls = []
  const fakeProvider = {
    name: 'claude',
    async chat({ system, messages }) {
      calls.push({ system, messages })
      return { text: 'A vigilância detectou movimento real na operação hoje.', usage: {}, model: 'claude-sonnet-5' }
    },
  }
  try {
    await withEnv({ SUPABASE_URL: 'https://example.test', SUPABASE_SERVICE_ROLE_KEY: 'x' }, async () => {
      // client tries to inject a fabricated metric — must be ignored entirely
      const out = await generateDailyNarrative({ metrics: { revenue: 999999999 } }, { provider: fakeProvider })
      assert.equal(out.source, 'real')
      assert.equal(out.narrative, 'A vigilância detectou movimento real na operação hoje.')
      const userMsg = calls[0].messages[0].content
      assert.doesNotMatch(userMsg, /999999999/)
      assert.match(userMsg, /500|R\$/)
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('getAgentActivity reports unavailable without Supabase configured', async () => {
  await withEnv({}, async () => {
    const out = await getAgentActivity({})
    assert.equal(out.source, 'unavailable')
    assert.deepEqual(out.activity, [])
  })
})

test('getAgentActivity labels each real job with the department that owns its stage, never claiming a specific execution', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async (url) => {
    const href = String(url)
    if (href.includes('/rest/v1/content_jobs')) {
      return new Response(JSON.stringify([
        { id: 'job-1', titulo: 'Vídeo de lançamento', etapa: 'video', atualizado_em: '2026-09-15T00:00:00Z' },
        { id: 'job-2', titulo: 'Post publicado', etapa: 'publicado', atualizado_em: '2026-09-14T00:00:00Z' },
      ]), { status: 200 })
    }
    throw new Error(`fetch inesperado: ${href}`)
  }
  try {
    await withEnv({ SUPABASE_URL: 'https://example.test', SUPABASE_SERVICE_ROLE_KEY: 'x' }, async () => {
      const out = await getAgentActivity({})
      assert.equal(out.source, 'real')
      assert.equal(out.activity.length, 2)
      assert.equal(out.activity[0].agente.slug, 'video-ai')
      assert.equal(out.activity[1].agente.slug, 'youtube')
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})
