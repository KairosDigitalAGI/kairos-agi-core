import assert from 'node:assert/strict'
import test, { after } from 'node:test'
import { mkdtempSync, readFileSync, readdirSync, rmdirSync, unlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const directory = mkdtempSync(join(tmpdir(), 'kairos-runtime-runs-test-'))
const file = join(directory, 'runs.json')
process.env.KAIROS_RUNTIME_RUNS_PATH = file
const { upsertRun, pendingRuns, acknowledgeRuns } = await import('../ops/kairos-whatsapp/runtimeRuns.cjs')
const { requireRunReceipt } = await import('../ops/kairos-whatsapp/runReceipt.cjs')
after(() => { for (const name of readdirSync(directory)) unlinkSync(join(directory, name)); rmdirSync(directory); delete process.env.KAIROS_RUNTIME_RUNS_PATH })

test('run outbox only acknowledges the exact snapshot remotely confirmed', () => {
  const first = upsertRun({ run_ref: 'campaign-2026-10-16', run_type: 'campaign', state: 'running', target_count: 30 })
  const updated = upsertRun({ run_ref: first.run_ref, run_type: 'campaign', state: 'completed', attempted: 12 })
  assert.equal(updated.revision, first.revision + 1)
  assert.equal(acknowledgeRuns([first]), 0)
  assert.equal(pendingRuns().length, 1)
  assert.equal(acknowledgeRuns([updated]), 1)
  assert.equal(pendingRuns().length, 0)
  assert.throws(() => upsertRun({ run_type: 'campaign', state: 'running' }), /run_ref/)
})

test('run receipt must list every sent reference before the outbox can clear', () => {
  const snapshots = [{ run_ref: 'a' }, { run_ref: 'b' }]
  assert.doesNotThrow(() => requireRunReceipt({ accepted: 2, acceptedRefs: ['b', 'a'] }, snapshots))
  assert.throws(() => requireRunReceipt({ accepted: 1, acceptedRefs: ['a'] }, snapshots), /não confirmou/)
  assert.throws(() => requireRunReceipt({ accepted: 2, acceptedRefs: ['a', 'c'] }, snapshots), /não confirmou/)
  assert.throws(() => requireRunReceipt({ accepted: 2 }, snapshots), /não confirmou/)
})

test('legacy pending runs without revision can be acknowledged after a matching receipt', () => {
  writeFileSync(file, JSON.stringify([{ run_ref: 'legacy-1', run_type: 'campaign', state: 'completed', pending_sync: true }]), 'utf8')
  const [legacy] = pendingRuns()
  assert.equal(legacy.revision, 0)
  assert.equal(acknowledgeRuns([legacy]), 1)
  assert.equal(pendingRuns().length, 0)
  assert.equal(JSON.parse(readFileSync(file, 'utf8'))[0].revision, 0)
})

test('legacy snapshot receipt does not acknowledge a newer revision', () => {
  writeFileSync(file, JSON.stringify([{ run_ref: 'legacy-2', run_type: 'campaign', state: 'running', pending_sync: true }]), 'utf8')
  const [legacy] = pendingRuns()
  const updated = upsertRun({ run_ref: legacy.run_ref, run_type: 'campaign', state: 'completed' })
  assert.equal(updated.revision, 1)
  assert.equal(acknowledgeRuns([legacy]), 0)
  assert.equal(pendingRuns()[0].revision, 1)
  assert.equal(acknowledgeRuns([updated]), 1)
})

test('corrupt run ledger fails closed without erasing the file', () => {
  writeFileSync(file, '{broken', 'utf8')
  assert.throws(() => upsertRun({ run_ref: 'recovery-1', run_type: 'recovery', state: 'running' }), /ilegível/)
  assert.equal(readFileSync(file, 'utf8'), '{broken')
})

test('invalid explicit revision fails closed without rewriting the ledger', () => {
  const original = JSON.stringify([{ run_ref: 'bad-version', pending_sync: true, revision: -1 }])
  writeFileSync(file, original, 'utf8')
  assert.throws(() => pendingRuns(), /inválido/)
  assert.equal(readFileSync(file, 'utf8'), original)
})

test('retention never drops pending runs when acknowledged history exceeds 250', () => {
  const acknowledged = Array.from({ length: 251 }, (_, index) => ({ run_ref: `old-${index}`, pending_sync: false, revision: 1 }))
  const pending = Array.from({ length: 251 }, (_, index) => ({ run_ref: `pending-${index}`, pending_sync: true, revision: 1 }))
  writeFileSync(file, JSON.stringify([...acknowledged, ...pending]), 'utf8')
  upsertRun({ run_ref: 'fresh', run_type: 'replenishment', state: 'running' })
  const stored = JSON.parse(readFileSync(file, 'utf8'))
  assert.equal(stored.filter(run => run.pending_sync).length, 252)
  assert.equal(stored.filter(run => !run.pending_sync).length, 250)
})
