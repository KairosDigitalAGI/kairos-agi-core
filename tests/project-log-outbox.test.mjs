import assert from 'node:assert/strict'
import test, { after } from 'node:test'
import { mkdtempSync, readFileSync, readdirSync, rmdirSync, unlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { flushProjectLog, queueProjectLog, readOutbox } from '../scripts/project-log-outbox.mjs'

const directory = mkdtempSync(join(tmpdir(), 'kairos-project-log-outbox-'))
const file = join(directory, 'pending.jsonl')
const entry = { agent: 'codex', phase: 'Missão 042', type: 'done', title: 'Preflight da ponte', description: 'Verificado localmente.', commit: 'd2f8f14', deployed: false }
after(() => { for (const name of readdirSync(directory)) unlinkSync(join(directory, name)); rmdirSync(directory) })

test('outbox queues once and preserves a corrupt file for recovery', () => {
  assert.deepEqual(queueProjectLog({ ...entry, secret: 'never-store-this' }, file), { queued: true, pending: 1 })
  assert.deepEqual(queueProjectLog(entry, file), { queued: false, pending: 1 })
  assert.equal(readOutbox(file).length, 1)
  assert.doesNotMatch(readFileSync(file, 'utf8'), /never-store-this/)
  writeFileSync(file, '{broken\n', 'utf8')
  assert.throws(() => queueProjectLog(entry, file), /ilegível/)
  assert.equal(readFileSync(file, 'utf8'), '{broken\n')
})

test('outbox retains entries on 402 and flushes after the Map returns', async () => {
  writeFileSync(file, '', 'utf8')
  queueProjectLog(entry, file)
  await assert.rejects(() => flushProjectLog({ base: 'https://example.test', auth: 'Basic test', file, fetchImpl: async () => new Response('', { status: 402 }) }), /indisponível/)
  assert.equal(readOutbox(file).length, 1)
  const requests = []
  const sent = await flushProjectLog({ base: 'https://example.test', auth: 'Basic test', file, fetchImpl: async (_url, options) => {
    requests.push(options?.method || 'GET')
    return options?.method === 'POST'
      ? new Response(JSON.stringify({ entry: { id: '1' } }), { status: 201 })
      : new Response(JSON.stringify({ source: 'real', entries: [] }), { status: 200 })
  } })
  assert.deepEqual(sent, { sent: 1, alreadyPresent: 0, pending: 0 })
  assert.deepEqual(requests, ['GET', 'POST'])
  assert.equal(readOutbox(file).length, 0)
})

test('outbox skips an entry already visible in the remote Map', async () => {
  queueProjectLog(entry, file)
  const result = await flushProjectLog({ base: 'https://example.test', auth: 'Basic test', file, fetchImpl: async (_url, options) => {
    assert.equal(options?.method, undefined)
    return new Response(JSON.stringify({ source: 'real', entries: [entry] }), { status: 200 })
  } })
  assert.deepEqual(result, { sent: 0, alreadyPresent: 1, pending: 0 })
})
