import test from 'node:test'
import assert from 'node:assert/strict'
import { createHunterOpportunity, nextHunterStage } from '../src/features/hunter/domain.ts'

test('public Instagram prospect starts with unverified contact permission', () => {
  const prospect = createHunterOpportunity({ source: 'Instagram público', title: ' CLIENT_001 ', url: 'https://example.com/', summary: 'Perfil público observado', budget: '' }, 'id-1', '2026-09-30T00:00:00Z')
  assert.equal(prospect.title, 'CLIENT_001')
  assert.equal(prospect.stage, 'triagem')
  assert.equal(prospect.contactPermission, 'not_verified')
  assert.equal(prospect.budget, 'Orçamento não informado')
})

test('local stage advancement stops before claiming a message was sent', () => {
  assert.equal(nextHunterStage('triagem'), 'qualificada')
  assert.equal(nextHunterStage('qualificada'), 'proposta pronta')
  assert.equal(nextHunterStage('proposta pronta'), null)
})
