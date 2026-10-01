import assert from 'node:assert/strict'
import test from 'node:test'
import { checkCrmSyncAuth, normalizeCrmLead } from '../api/_crm.js'

test('CRM sync requires the configured bearer token', () => {
  const previous = process.env.CRM_SYNC_TOKEN
  process.env.CRM_SYNC_TOKEN = 'token-de-teste'
  try {
    assert.equal(checkCrmSyncAuth({ headers: { authorization: 'Bearer token-de-teste' } }), true)
    assert.equal(checkCrmSyncAuth({ headers: { authorization: 'Bearer incorreto' } }), false)
    assert.equal(checkCrmSyncAuth({ headers: {} }), false)
  } finally {
    if (previous === undefined) delete process.env.CRM_SYNC_TOKEN
    else process.env.CRM_SYNC_TOKEN = previous
  }
})

test('CRM normalization constrains source data without inventing fields', () => {
  const row = normalizeCrmLead({
    source_ref: ' lead-001 ', name: ' Empresa exemplo ', state: 'estado-desconhecido',
    score: 180, attempts: -4, contacted: 1, meeting_scheduled: false,
    source_updated_at: '2026-10-01T08:00:00Z',
  })
  assert.equal(row.source, 'kairos_whatsapp')
  assert.equal(row.source_ref, 'lead-001')
  assert.equal(row.name, 'Empresa exemplo')
  assert.equal(row.state, 'abertura')
  assert.equal(row.score, 100)
  assert.equal(row.attempts, 0)
  assert.equal(row.contacted, true)
  assert.equal(row.source_updated_at, '2026-10-01T08:00:00.000Z')
  assert.equal(row.niche, null)
})

test('CRM normalization rejects entries without a stable source reference', () => {
  assert.throws(() => normalizeCrmLead({ name: 'Sem referência' }), /source_ref ausente/)
})
