import test from 'node:test'
import assert from 'node:assert/strict'
import { missingPressKitViews, pressKitReadiness, pressKitViews } from '../src/engines/clone/pressKit.ts'
import { recordError } from '../src/engines/clone/domain.ts'

test('press kit flags exactly the required missing views', () => {
  assert.equal(missingPressKitViews(pressKitViews.join('; ')).length, 0)
  assert.match(pressKitReadiness(pressKitViews.join('; ')), /completo/)
  assert.deepEqual(missingPressKitViews('Rosto frontal; Perfil esquerdo').slice(0, 2), ['Rosto 3/4', 'Perfil direito'])
})

test('character bible requires continuity, press kit and rights', () => {
  const fields = { series: 'Kairos', role: 'Founder', visualInvariant: 'Cabelo e jaqueta', wardrobe: 'Roxo', pressKit: pressKitViews.join('; '), rights: 'Autorizado pelo titular' }
  assert.equal(recordError('character', 'Kairos Founder', fields), '')
  assert.match(recordError('character', 'Kairos Founder', { ...fields, pressKit: '' }), /press kit/i)
})
