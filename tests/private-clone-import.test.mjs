import assert from 'node:assert/strict'
import test from 'node:test'
import { planPrivateImageImport, privateReferenceName } from '../src/features/studio/privateCloneImport.ts'

const image = (name, size = 1024, type = 'image/png') => ({ name, size, type, lastModified: 1 })
const stored = (name, size = 1024, type = 'image/png') => ({ id: name, name, note: '', createdAt: '', blob: new Blob(['x'.repeat(size)], { type }) })

test('private clone collection import accepts valid unique images and rejects unsafe inputs', () => {
  const plan = planPrivateImageImport([
    image('frente.png'),
    image('frente.png'),
    image('perfil.jpg', 2048, 'image/jpeg'),
    image('video.mp4', 2048, 'video/mp4'),
    image('gigante.png', 9 * 1024 * 1024),
  ], [stored('existente')])

  assert.deepEqual(plan.accepted.map(file => file.name), ['frente.png', 'perfil.jpg'])
  assert.equal(plan.rejectedDuplicate, 1)
  assert.equal(plan.rejectedInvalid, 2)
  assert.equal(plan.rejectedCapacity, 0)
})

test('private clone collection import deduplicates stored references and enforces capacity', () => {
  const plan = planPrivateImageImport([
    image('existente.png'),
    image('nova-a.png'),
    image('nova-b.png'),
  ], [stored('existente')], 2)

  assert.deepEqual(plan.accepted.map(file => file.name), ['nova-a.png'])
  assert.equal(plan.rejectedDuplicate, 1)
  assert.equal(plan.rejectedCapacity, 1)
  assert.equal(privateReferenceName('  .png'), 'Referência sem nome')
})
