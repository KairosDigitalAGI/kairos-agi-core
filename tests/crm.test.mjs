import assert from 'node:assert/strict'
import test from 'node:test'
import { checkCrmSyncAuth, normalizeCrmEvent, normalizeCrmLead, normalizeCrmRuntimeRun, summarizeCrmDaily, summarizeCrmRuntime } from '../api/_crm.js'

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

test('CRM event normalization keeps a bounded auditable event', () => {
  const row = normalizeCrmEvent({
    event_ref: 'evt-001', lead_source_ref: 'lead-001', event_type: 'delivery',
    direction: 'outbound', status: 'delivered', summary: 'Mensagem confirmada',
    metadata: { ack: 2 }, occurred_at: '2026-10-01T13:52:00Z',
  })
  assert.equal(row.source, 'kairos_whatsapp')
  assert.equal(row.event_type, 'delivery')
  assert.equal(row.status, 'delivered')
  assert.equal(row.occurred_at, '2026-10-01T13:52:00.000Z')
  assert.deepEqual(row.metadata, { ack: 2 })
})

test('CRM event normalization rejects unknown event types and unstable references', () => {
  assert.throws(() => normalizeCrmEvent({ event_type: 'magic' }), /obrigatórios/)
  assert.throws(() => normalizeCrmEvent({ event_ref: 'evt', lead_source_ref: 'lead', event_type: 'magic', occurred_at: new Date().toISOString() }), /event_type inválido/)
})

test('CRM runtime summary projects only synchronized facts', () => {
  const rows = [
    { contacted: false, phone: '5562999999999', score: 9, state: 'abertura', synced_at: '2026-10-07T10:00:00Z' },
    { contacted: true, phone: '5562888888888', score: 12, state: 'interesse', synced_at: '2026-10-07T11:00:00Z' },
    { contacted: false, phone: null, score: 10, state: 'sem_whatsapp', synced_at: '2026-10-07T09:00:00Z' },
  ]
  const events = [
    { event_type: 'inbound_message', direction: 'inbound', status: 'received', occurred_at: '2026-10-07T11:01:00Z' },
    { event_type: 'delivery', direction: 'outbound', status: 'delivered', occurred_at: '2026-10-07T11:02:00Z' },
  ]
  assert.deepEqual(summarizeCrmRuntime(rows, events), { source: 'crm_projection', eligible: 1, contacted: 1, invalid: 1, inbound: 1, outbound: 0, delivered: 1, blocked: 0, failed: 0, lastSyncedAt: '2026-10-07T11:02:00.000Z' })
})

test('CRM runtime summary stays unavailable without synchronized rows', () => {
  assert.deepEqual(summarizeCrmRuntime([], []), { source: 'unavailable', eligible: 0, contacted: 0, invalid: 0, inbound: 0, outbound: 0, delivered: 0, blocked: 0, failed: 0, lastSyncedAt: null })
})

test('CRM daily ledger groups facts in Brasilia time without filling absent days', () => {
  const events = [
    { event_type: 'inbound_message', direction: 'inbound', status: 'received', occurred_at: '2026-10-08T02:30:00Z' },
    { event_type: 'outbound_message', direction: 'outbound', status: 'sent', occurred_at: '2026-10-08T03:30:00Z' },
    { event_type: 'delivery', direction: 'outbound', status: 'delivered', occurred_at: '2026-10-08T03:31:00Z' },
    { event_type: 'meeting', direction: 'system', status: 'applied', occurred_at: '2026-10-08T12:00:00Z' },
  ]
  assert.deepEqual(summarizeCrmDaily(events), [
    { date: '2026-10-08', total: 3, classified: 0, inbound: 0, outbound: 1, delivered: 1, blocked: 0, failed: 0, meetings: 1 },
    { date: '2026-10-07', total: 1, classified: 0, inbound: 1, outbound: 0, delivered: 0, blocked: 0, failed: 0, meetings: 0 },
  ])
})

test('CRM daily ledger remains empty without events', () => {
  assert.deepEqual(summarizeCrmDaily([]), [])
})

test('CRM runtime run normalization preserves verified counters and identity', () => {
  const row = normalizeCrmRuntimeRun({
    run_ref: 'campaign-2026-10-09', run_type: 'campaign', state: 'completed',
    scheduled_for: '2026-10-09T10:00:00Z', started_at: '2026-10-09T10:00:03Z', finished_at: '2026-10-09T10:18:00Z',
    target_count: 30, eligible_before: 47, attempted: 30, delivered: 27, responses: 4, opt_outs: 1,
  })
  assert.equal(row.source, 'kairos_whatsapp')
  assert.equal(row.run_ref, 'campaign-2026-10-09')
  assert.equal(row.attempted, 30)
  assert.equal(row.delivered, 27)
  assert.equal(row.responses, 4)
  assert.equal(row.opt_outs, 1)
})

test('CRM runtime run rejects finished runs without a completion timestamp', () => {
  assert.throws(() => normalizeCrmRuntimeRun({ run_ref: 'night-1', run_type: 'replenishment', state: 'completed', started_at: '2026-10-09T01:00:00Z' }), /finished_at/)
  assert.throws(() => normalizeCrmRuntimeRun({ run_ref: 'night-2', run_type: 'unknown', state: 'running', started_at: '2026-10-09T01:00:00Z' }), /run_type/)
})
