import test from 'node:test'
import assert from 'node:assert/strict'
import { computeContentPipeline, createContentJob, generateScript } from '../api/_content.js'

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

test('content pipeline reports unavailable (never an empty-but-real pipeline) without Supabase configured', async () => {
  await withEnv({}, async () => {
    const out = await computeContentPipeline()
    assert.equal(out.source, 'unavailable')
    assert.deepEqual(out.jobs, [])
  })
})

test('content pipeline surfaces the pending-migration hint instead of a generic 500 when the table does not exist yet', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => new Response('relation "command.content_jobs" does not exist', { status: 404 })
  try {
    await withEnv({ SUPABASE_URL: 'https://example.test', SUPABASE_SERVICE_ROLE_KEY: 'x' }, async () => {
      const out = await computeContentPipeline()
      assert.equal(out.source, 'unavailable')
      assert.match(out.reason, /0020_content_engine\.sql/)
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('createContentJob fails closed (503) without Supabase configured, never pretending a job was created', async () => {
  await withEnv({}, async () => {
    await assert.rejects(createContentJob({ titulo: 'ideia nova' }), /SUPABASE_URL/)
  })
})

test('createContentJob surfaces the pending-migration hint on write failure', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => new Response('relation "command.content_jobs" does not exist', { status: 404 })
  try {
    await withEnv({ SUPABASE_URL: 'https://example.test', SUPABASE_SERVICE_ROLE_KEY: 'x' }, async () => {
      await assert.rejects(createContentJob({ titulo: 'ideia nova' }), /0020_content_engine\.sql/)
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})

// --- generateScript: só roda com um clique explícito do Founder, nunca em lote ---

test('generateScript requires a jobId (400) before touching anything', async () => {
  await assert.rejects(generateScript({}), /jobId/)
})

test('generateScript fails closed (503) without Supabase configured', async () => {
  await withEnv({}, async () => {
    await assert.rejects(generateScript({ jobId: 'abc' }), /SUPABASE_URL/)
  })
})

test('generateScript reports 404 when the job does not exist', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => new Response(JSON.stringify([]), { status: 200 })
  try {
    await withEnv({ SUPABASE_URL: 'https://example.test', SUPABASE_SERVICE_ROLE_KEY: 'x' }, async () => {
      await assert.rejects(generateScript({ jobId: 'abc' }), /não encontrado/)
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('generateScript refuses (409) a job that is not in etapa=ideia — never regenerates silently', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => new Response(JSON.stringify([{ id: 'abc', titulo: 'x', etapa: 'roteiro', briefing: {} }]), { status: 200 })
  try {
    await withEnv({ SUPABASE_URL: 'https://example.test', SUPABASE_SERVICE_ROLE_KEY: 'x' }, async () => {
      await assert.rejects(generateScript({ jobId: 'abc' }), /etapa "roteiro"/)
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('generateScript fails closed without any paid LLM provider configured', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => new Response(JSON.stringify([{ id: 'abc', titulo: 'x', etapa: 'ideia', briefing: {} }]), { status: 200 })
  try {
    await withEnv({ SUPABASE_URL: 'https://example.test', SUPABASE_SERVICE_ROLE_KEY: 'x' }, async () => {
      await assert.rejects(generateScript({ jobId: 'abc' }), /nenhum provider de LLM configurado/)
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('generateScript writes the real script and advances the job to etapa=roteiro on success', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async (url, opts = {}) => {
    const href = String(url)
    if (href.includes('api.anthropic.com')) {
      return new Response(JSON.stringify({ content: [{ type: 'text', text: 'CENA 1: ...' }], usage: { input_tokens: 10, output_tokens: 20 }, model: 'claude-sonnet-5', stop_reason: 'end_turn' }), { status: 200 })
    }
    if (href.includes('content_jobs') && (!opts.method || opts.method === 'GET')) {
      return new Response(JSON.stringify([{ id: 'abc', titulo: 'x', etapa: 'ideia', briefing: { publico: 'clínicas' } }]), { status: 200 })
    }
    if (href.includes('content_assets') && opts.method === 'POST') {
      return new Response(JSON.stringify([{ id: 'asset-1', job_id: 'abc', tipo: 'roteiro', conteudo: 'CENA 1: ...' }]), { status: 201 })
    }
    if (href.includes('content_jobs') && opts.method === 'PATCH') {
      return new Response(JSON.stringify([{ id: 'abc', titulo: 'x', etapa: 'roteiro' }]), { status: 200 })
    }
    throw new Error(`fetch inesperado neste teste: ${opts.method || 'GET'} ${href}`)
  }
  try {
    await withEnv({ SUPABASE_URL: 'https://example.test', SUPABASE_SERVICE_ROLE_KEY: 'x', ANTHROPIC_API_KEY: 'x' }, async () => {
      const out = await generateScript({ jobId: 'abc' })
      assert.equal(out.job.etapa, 'roteiro')
      assert.equal(out.asset.tipo, 'roteiro')
      assert.equal(out.asset.conteudo, 'CENA 1: ...')
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})
