import assert from 'node:assert/strict'
import test from 'node:test'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

test('versioned WhatsApp bridge loads the audited outbox modules', () => {
  const bridge = require('../ops/kairos-whatsapp/agiBridge.cjs')
  assert.equal(typeof bridge.start, 'function')
  assert.equal(typeof bridge.syncNow, 'function')
  assert.equal(typeof bridge.pollUpdates, 'function')
})
