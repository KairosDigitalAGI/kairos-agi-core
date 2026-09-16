import test from 'node:test'
import assert from 'node:assert/strict'
import { listProjectLog, addProjectLogEntry } from '../api/_project-log.js'

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

test('listProjectLog reports unavailable (never fabricating history) without Supabase configured', async () => {
  await withEnv({}, async () => {
    const out = await listProjectLog()
    assert.equal(out.source, 'unavailable')
    assert.match(out.reason, /SUPABASE_URL/)
    assert.deepEqual(out.entries, [])
  })
})

test('listProjectLog surfaces the pending-migration hint when the table does not exist yet', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => new Response('relation "command.project_log" does not exist', { status: 404 })
  try {
    await withEnv({ SUPABASE_URL: 'https://example.test', SUPABASE_SERVICE_ROLE_KEY: 'x' }, async () => {
      const out = await listProjectLog()
      assert.equal(out.source, 'unavailable')
      assert.match(out.reason, /0023_project_log\.sql/)
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('listProjectLog returns the real rows ordered by created_at desc, most recent first', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async (url) => {
    const href = String(url)
    if (href.includes('/rest/v1/project_log') && href.includes('order=created_at.desc')) {
      return new Response(JSON.stringify([
        { id: '2', created_at: '2026-09-15T12:00:00Z', agent: 'claude-code', phase: 'Fase 13', type: 'done', title: 'YouTube OAuth conectado + botão Ver conta conectada', description: null, commit: 'c54a230', deployed: true },
      ]), { status: 200 })
    }
    throw new Error(`fetch inesperado: ${href}`)
  }
  try {
    await withEnv({ SUPABASE_URL: 'https://example.test', SUPABASE_SERVICE_ROLE_KEY: 'x' }, async () => {
      const out = await listProjectLog()
      assert.equal(out.source, 'real')
      assert.equal(out.entries.length, 1)
      assert.equal(out.entries[0].commit, 'c54a230')
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('addProjectLogEntry rejects an unknown agent (400)', async () => {
  await assert.rejects(
    addProjectLogEntry({ agent: 'orion', type: 'done', title: 'x' }),
    /agent inválido/,
  )
})

test('addProjectLogEntry rejects an unknown type (400)', async () => {
  await assert.rejects(
    addProjectLogEntry({ agent: 'claude-code', type: 'wip', title: 'x' }),
    /type inválido/,
  )
})

test('addProjectLogEntry requires a title (400)', async () => {
  await assert.rejects(
    addProjectLogEntry({ agent: 'claude-code', type: 'done', title: '  ' }),
    /title/,
  )
})

test('addProjectLogEntry fails closed (503) without Supabase configured, never pretending an entry was saved', async () => {
  await withEnv({}, async () => {
    await assert.rejects(
      addProjectLogEntry({ agent: 'claude-code', type: 'done', title: 'x' }),
      /SUPABASE_URL/,
    )
  })
})

test('addProjectLogEntry inserts a real row with optional fields normalized (empty strings become null)', async () => {
  const originalFetch = globalThis.fetch
  let sent
  globalThis.fetch = async (url, opts = {}) => {
    const href = String(url)
    if (href.includes('/rest/v1/project_log') && opts.method === 'POST') {
      sent = JSON.parse(opts.body)
      return new Response(JSON.stringify([{ id: '1', created_at: '2026-09-15T00:00:00Z', ...sent }]), { status: 201 })
    }
    throw new Error(`fetch inesperado: ${opts.method || 'GET'} ${href}`)
  }
  try {
    await withEnv({ SUPABASE_URL: 'https://example.test', SUPABASE_SERVICE_ROLE_KEY: 'x' }, async () => {
      const row = await addProjectLogEntry({
        agent: 'claude-code',
        phase: 'Fase 14',
        type: 'done',
        title: '  Mapa do Projeto  ',
        description: '',
        commit: '',
        deployed: true,
      })
      assert.equal(sent.title, 'Mapa do Projeto')
      assert.equal(sent.description, null)
      assert.equal(sent.commit, null)
      assert.equal(sent.deployed, true)
      assert.equal(row.phase, 'Fase 14')
    })
  } finally {
    globalThis.fetch = originalFetch
  }
})
