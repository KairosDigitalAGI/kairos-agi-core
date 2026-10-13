import assert from 'node:assert/strict'
import test from 'node:test'
import { inspectPrivateCloneVault } from '../src/features/studio/privateCloneIntegrity.ts'

function clone(id, references = []) {
  return { id, name: `Clone ${id}`, note: '', createdAt: '2026-10-13T10:00:00.000Z', updatedAt: '2026-10-13T10:00:00.000Z', references }
}

function reference(id, bytes = [1, 2, 3], name = id) {
  return { id, name, note: '', createdAt: '2026-10-13T10:00:00.000Z', blob: new Blob([Uint8Array.from(bytes)], { type: 'image/png' }) }
}

test('private clone integrity creates a deterministic content fingerprint', async () => {
  const first = await inspectPrivateCloneVault([clone('b', [reference('2')]), clone('a', [reference('1', [8, 9])])])
  const reordered = await inspectPrivateCloneVault([clone('a', [reference('1', [8, 9])]), clone('b', [reference('2')])])
  const changed = await inspectPrivateCloneVault([clone('a', [reference('1', [8, 7])]), clone('b', [reference('2')])])

  assert.equal(first.fingerprint, reordered.fingerprint)
  assert.notEqual(first.fingerprint, changed.fingerprint)
  assert.equal(first.status, 'verified')
  assert.equal(first.referenceCount, 2)
  assert.equal(first.totalBytes, 5)
})

test('private clone integrity reports duplicates, empty clones and invalid files', async () => {
  const duplicate = reference('2', [1, 2, 3], 'Mesmo nome')
  const report = await inspectPrivateCloneVault([
    clone('empty'),
    clone('images', [reference('1', [1, 2, 3], 'Mesmo nome'), duplicate, { ...reference('3'), blob: new Blob([], { type: 'text/plain' }) }]),
  ])

  assert.equal(report.status, 'attention')
  assert.equal(report.emptyCloneCount, 1)
  assert.equal(report.duplicateReferenceCount, 1)
  assert.equal(report.invalidReferenceCount, 1)
})
