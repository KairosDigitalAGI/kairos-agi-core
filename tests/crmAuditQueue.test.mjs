import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { createRequire } from 'node:module'

const queuePath = path.join(os.tmpdir(), `kairos-crm-events-${process.pid}.jsonl`)
process.env.KAIROS_CRM_EVENTS_PATH = queuePath
const require = createRequire(import.meta.url)
const audit = require('../ops/kairos-whatsapp/crmAudit.cjs')

test('CRM audit queue keeps events until explicit acknowledgement', () => {
  try { fs.unlinkSync(queuePath) } catch {}
  const event = audit.appendEvent({ phone: '5562000000000', eventType: 'delivery', direction: 'outbound', status: 'delivered', summary: 'confirmada' })
  const pending = audit.pendingEvents()
  assert.equal(pending.length, 1)
  assert.equal(pending[0].event_ref, event.event_ref)
  assert.match(pending[0].lead_source_ref, /^[a-f0-9]{64}$/)
  assert.equal(audit.acknowledgeEvents([event.event_ref]), 1)
  assert.deepEqual(audit.pendingEvents(), [])
  try { fs.unlinkSync(queuePath) } catch {}
})

test('CRM audit queue fails closed on a corrupt line instead of discarding evidence', () => {
  const original = '{broken\n'
  fs.writeFileSync(queuePath, original, 'utf8')
  assert.throws(() => audit.pendingEvents(), /ilegível/)
  assert.throws(() => audit.acknowledgeEvents(['evt-1']), /ilegível/)
  assert.equal(fs.readFileSync(queuePath, 'utf8'), original)
  fs.unlinkSync(queuePath)
})

test('CRM audit acknowledgement preserves events appended after the sent batch', () => {
  try { fs.unlinkSync(queuePath) } catch {}
  const first = audit.appendEvent({ phone: '5562000000000', eventType: 'delivery' })
  const sent = audit.pendingEvents()
  const later = audit.appendEvent({ phone: '5562000000000', eventType: 'inbound_message' })
  assert.equal(audit.acknowledgeEvents(sent.map(event => event.event_ref)), 1)
  assert.deepEqual(audit.pendingEvents().map(event => event.event_ref), [later.event_ref])
  assert.notEqual(first.event_ref, later.event_ref)
  fs.unlinkSync(queuePath)
})
