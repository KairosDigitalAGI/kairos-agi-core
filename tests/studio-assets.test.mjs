import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { characterDirections } from '../src/features/studio/storyboard.ts'

test('Valt press kit is production-sized and registered with nonviolent continuity markers', async () => {
  const image = await readFile(new URL('../public/characters/valt-press-kit-v1.png', import.meta.url))
  assert.deepEqual([...image.subarray(1, 4)], [80, 78, 71])
  const width = image.readUInt32BE(16)
  const height = image.readUInt32BE(20)
  assert.ok(width >= 1500)
  assert.ok(height >= 800)
  const valt = characterDirections.find(character => character.name === 'VALT')
  assert.ok(valt)
  assert.match(valt.marker, /ampulheta/i)
  assert.match(valt.prop, /nunca arma/i)
})
