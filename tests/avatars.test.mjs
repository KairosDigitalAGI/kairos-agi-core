import test from 'node:test'
import assert from 'node:assert/strict'
import { listAvatars, ensureAvatar } from '../api/_avatars.js'
import registry from '../src/data/agentRegistry.json' with { type: 'json' }

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

test('listAvatars reports unavailable and still returns the full registry baseline (never fabricating progress) without Supabase configured', async () => {
  await withEnv({}, async () => {
    const out = await listAvatars()
    assert.equal(out.source, 'unavailable')
    assert.equal(out.avatars.length, registry.length)
    assert.ok(out.avatars.every((a) => a.hasProgress === false && a.nivel === 1 && a.xp === 0 && a.coins === 0))
  })
})

test('listAvatars merges real Supabase progress by agente_slug, leaving untracked agents at baseline', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async (url) => {
    const href = String(url)
    if (href.includes('/rest/v1/avatars')) {
      return new Response(JSON.stringify([
        { agente_slug: 'orion', nivel: 3, xp: 450, coins: 120.5, conquistas: ['primeira-venda'], atualizado_em: '2026-09-14T00:00:00Z' },
      ]), { status: 200 })
    }
    throw new Error(`fetch inesperado: ${href}`)
  }
  try {
    await withEnv({ SUPABASE_URL: 'https://example.test', SUPABASE_SERVICE_ROLE_KEY: 'x' }, async () => {
      const out = await listAvatars()
      assert.equal(out.source, 'real')
      const orion = out.avatars.find((a) => a.slug === 'orion')
      assert.equal(orion.hasProgress, true)
      assert.equal(orion.nivel, 3)
      assert.equal(orion.coins, 120.5)
      const cfo = out.avatars.find((a) => a.slug === 'cfo')
      assert.equal(cfo.hasProgress, false)
      assert.equal(cfo.nivel, 1)
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('ensureAvatar requires an agenteSlug (400)', async () => {
  await assert.rejects(ensureAvatar({ agenteSlug: '' }), /agenteSlug/)
})

test('ensureAvatar rejects an agent slug that does not exist in the registry (404) — never invents a new identity', async () => {
  await withEnv({ SUPABASE_URL: 'https://example.test', SUPABASE_SERVICE_ROLE_KEY: 'x' }, async () => {
    await assert.rejects(ensureAvatar({ agenteSlug: 'nao-existe' }), /agente desconhecido/)
  })
})

test('ensureAvatar fails closed (503) without Supabase configured, never pretending a row was created', async () => {
  await withEnv({}, async () => {
    await assert.rejects(ensureAvatar({ agenteSlug: 'orion' }), /SUPABASE_URL/)
  })
})

test('ensureAvatar upserts a baseline row for a known agent and returns the merged identity+progress', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async (url, opts = {}) => {
    const href = String(url)
    if (href.includes('/rest/v1/avatars') && href.includes('on_conflict=agente_slug') && opts.method === 'POST') {
      return new Response(JSON.stringify([{ agente_slug: 'orion', nivel: 1, xp: 0, coins: 0, conquistas: [], atualizado_em: '2026-09-15T00:00:00Z' }]), { status: 201 })
    }
    throw new Error(`fetch inesperado: ${opts.method || 'GET'} ${href}`)
  }
  try {
    await withEnv({ SUPABASE_URL: 'https://example.test', SUPABASE_SERVICE_ROLE_KEY: 'x' }, async () => {
      const avatar = await ensureAvatar({ agenteSlug: 'orion' })
      assert.equal(avatar.hasProgress, true)
      assert.equal(avatar.name, 'ORION')
      assert.equal(avatar.nivel, 1)
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})
