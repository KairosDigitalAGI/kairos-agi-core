import test from 'node:test'
import assert from 'node:assert/strict'
import { createOffice, disposeOffice } from '../src/world/legacy/officeGeometry.js'
test('reused office builds finite geometry with sixteen workstations and can be disposed', () => {
  const office = createOffice('#7c3aed')
  const meshes = []
  office.traverse(object => { if (object.isMesh) { meshes.push(object); assert.ok(object.position.toArray().every(Number.isFinite)) } })
  assert.ok(meshes.length > 20)
  assert.ok(meshes.some(mesh => mesh.isInstancedMesh && mesh.count === 16))
  disposeOffice(office)
})
