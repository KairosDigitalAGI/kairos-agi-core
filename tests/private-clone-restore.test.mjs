import assert from 'node:assert/strict'
import test from 'node:test'
import { planPrivateCloneRestore } from '../src/features/studio/privateCloneRestore.ts'

const at = '2026-10-15T12:00:00.000Z'
const ref = (id) => ({ id, name: id, note: '', createdAt: at, blob: new Blob([id], { type: 'image/png' }) })
const clone = (id, references = [], note = '') => ({ id, name: id, note, createdAt: at, updatedAt: at, references })

test('restore merges missing references without replacing current edits or images', async () => {
  const current = clone('founder', [ref('front')], 'Nota atual')
  const backup = clone('founder', [ref('front'), ref('profile')], 'Nota antiga')
  const plan = planPrivateCloneRestore([current], [backup, clone('partner', [ref('portrait')])], '2026-10-15T13:00:00.000Z')

  assert.equal(plan.newClones, 1)
  assert.equal(plan.mergedClones, 1)
  assert.equal(plan.addedReferences, 2)
  assert.equal(plan.skippedReferences, 1)
  assert.equal(plan.writes[0].note, 'Nota atual')
  assert.strictEqual(plan.writes[0].references[0], current.references[0])
  assert.deepEqual(plan.writes[0].references.map(item => item.id), ['front', 'profile'])
  assert.equal((await current.references[0].blob.text()), 'front')
})

test('restore is idempotent and rejects repeated identifiers in a backup', () => {
  const current = clone('founder', [ref('front')])
  const same = planPrivateCloneRestore([current], [clone('founder', [ref('front')])])
  assert.deepEqual(same.writes, [])
  assert.equal(same.skippedReferences, 1)
  assert.throws(() => planPrivateCloneRestore([], [clone('x'), clone('x')]), /repetidos/)
  assert.throws(() => planPrivateCloneRestore([], [clone('x', [ref('a'), ref('a')])]), /repetidos/)
})

test('restore keeps the per-clone reference limit when merging', () => {
  const current = clone('founder', Array.from({ length: 49 }, (_, index) => ref(`existing-${index}`)))
  const plan = planPrivateCloneRestore([current], [clone('founder', [ref('new-1'), ref('new-2')])])
  assert.equal(plan.addedReferences, 1)
  assert.equal(plan.skippedReferences, 1)
  assert.equal(plan.writes[0].references.length, 50)
})
