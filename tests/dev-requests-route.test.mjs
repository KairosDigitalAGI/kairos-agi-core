import assert from 'node:assert/strict'
import test from 'node:test'
import handler from '../api/hunter.mjs'

test('technical queue refuses unauthenticated reads before touching CRM', async () => {
  const previousUser = process.env.KAIROS_USER
  const previousPass = process.env.KAIROS_PASS
  process.env.KAIROS_USER = 'owner-test'
  process.env.KAIROS_PASS = 'secret-test'
  try {
    const req = { method: 'GET', query: { action: 'dev-requests' }, headers: {} }
    const res = {
      code: 200,
      setHeader() { return this },
      status(code) { this.code = code; return this },
      end() { return this },
      json(value) { this.value = value; return this },
    }
    await handler(req, res)
    assert.equal(res.code, 401)
    assert.equal(res.value, undefined)
  } finally {
    if (previousUser === undefined) delete process.env.KAIROS_USER; else process.env.KAIROS_USER = previousUser
    if (previousPass === undefined) delete process.env.KAIROS_PASS; else process.env.KAIROS_PASS = previousPass
  }
})
