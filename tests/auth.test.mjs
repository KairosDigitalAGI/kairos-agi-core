import test from 'node:test'
import assert from 'node:assert/strict'
import { checkAuth, unauthorized } from '../api/_auth.js'

test('operational auth accepts only the configured Basic credentials', () => {
  const previousUser = process.env.KAIROS_USER
  const previousPass = process.env.KAIROS_PASS
  process.env.KAIROS_USER = 'founder'
  process.env.KAIROS_PASS = 'private'
  try {
    const valid = `Basic ${Buffer.from('founder:private').toString('base64')}`
    const invalid = `Basic ${Buffer.from('founder:wrong').toString('base64')}`
    assert.equal(checkAuth({ headers: { authorization: valid } }), true)
    assert.equal(checkAuth({ headers: { authorization: invalid } }), false)
  } finally {
    if (previousUser === undefined) delete process.env.KAIROS_USER
    else process.env.KAIROS_USER = previousUser
    if (previousPass === undefined) delete process.env.KAIROS_PASS
    else process.env.KAIROS_PASS = previousPass
  }
})

test('API 401 does not trigger the browser native Basic Auth dialog', () => {
  const headers = new Map()
  const response = {
    setHeader(name, value) { headers.set(name.toLowerCase(), value) },
    status(code) { this.statusCode = code; return this },
    end() { return this },
  }
  unauthorized(response)
  assert.equal(response.statusCode, 401)
  assert.equal(headers.has('www-authenticate'), false)
  assert.equal(headers.get('cache-control'), 'no-store')
})
