import assert from 'node:assert/strict'
import test from 'node:test'
import { exportPrivateCloneBackup, importPrivateCloneBackup } from '../src/features/studio/privateCloneBackup.ts'

const clone = {
  id: 'founder-1',
  name: 'Founder',
  note: 'Uso autorizado',
  createdAt: '2026-10-12T10:00:00.000Z',
  updatedAt: '2026-10-12T10:00:00.000Z',
  references: [{
    id: 'front-1',
    name: 'Rosto frontal',
    note: 'Expressão neutra',
    createdAt: '2026-10-12T10:00:00.000Z',
    blob: new Blob([Uint8Array.from([137, 80, 78, 71])], { type: 'image/png' }),
  }],
}

test('private clone backup encrypts and restores metadata and image bytes', async () => {
  const backup = await exportPrivateCloneBackup([clone], 'senha-local-segura')
  const raw = await backup.text()
  assert.doesNotMatch(raw, /Rosto frontal|Uso autorizado/)

  const restored = await importPrivateCloneBackup(backup, 'senha-local-segura')
  assert.equal(restored.length, 1)
  assert.equal(restored[0].name, 'Founder')
  assert.equal(restored[0].references[0].name, 'Rosto frontal')
  assert.equal(restored[0].references[0].blob.type, 'image/png')
  assert.deepEqual([...new Uint8Array(await restored[0].references[0].blob.arrayBuffer())], [137, 80, 78, 71])
})

test('private clone backup fails closed for a wrong password or malformed file', async () => {
  const backup = await exportPrivateCloneBackup([clone], 'senha-local-segura')
  await assert.rejects(() => importPrivateCloneBackup(backup, 'senha-incorreta-00'), /senha|integridade/i)
  await assert.rejects(() => importPrivateCloneBackup(new Blob(['{}']), 'senha-local-segura'), /formato|versão/i)
  await assert.rejects(() => exportPrivateCloneBackup([clone], 'curta'), /10 caracteres/i)
})
