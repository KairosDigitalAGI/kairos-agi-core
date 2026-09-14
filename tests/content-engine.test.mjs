import test from 'node:test'
import assert from 'node:assert/strict'
import { computeContentPipeline, createContentJob } from '../api/_content.js'

const KEYS = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']

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
