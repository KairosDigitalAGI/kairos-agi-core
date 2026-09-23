import test from 'node:test'
import assert from 'node:assert/strict'
import handler from '../api/[route].mjs'

function fakeRes() {
  const res = {
    statusCode: undefined,
    headers: {},
    body: undefined,
    setHeader(k, v) { this.headers[k] = v },
    status(code) { this.statusCode = code; return this },
    json(body) { this.body = body; return this },
    end() { return this },
  }
  return res
}

test('unknown top-level route is a 404, not a crash', async () => {
  const req = { method: 'GET', headers: {}, query: { route: 'does-not-exist' } }
  const res = fakeRes()
  await handler(req, res)
  assert.equal(res.statusCode, 404)
})

test('GET /api/project-log stays public (no Basic Auth), matching its pre-consolidation contract', async () => {
  delete process.env.KAIROS_USER
  delete process.env.KAIROS_PASS
  delete process.env.SUPABASE_URL
  delete process.env.SUPABASE_SERVICE_ROLE_KEY
  const req = { method: 'GET', headers: {}, query: { route: 'project-log' } }
  const res = fakeRes()
  await handler(req, res)
  assert.equal(res.statusCode, 200)
})

test('POST /api/project-log requires Basic Auth', async () => {
  delete process.env.KAIROS_USER
  delete process.env.KAIROS_PASS
  const req = { method: 'POST', headers: {}, body: {}, query: { route: 'project-log' } }
  const res = fakeRes()
  await handler(req, res)
  assert.equal(res.statusCode, 401)
})

for (const route of ['agent-chat', 'agent-status', 'business-metrics', 'content-jobs']) {
  test(`${route} fails closed (401) without Basic Auth credentials, same as before consolidation`, async () => {
    delete process.env.KAIROS_USER
    delete process.env.KAIROS_PASS
    const req = { method: 'GET', headers: {}, body: {}, query: { route } }
    const res = fakeRes()
    await handler(req, res)
    assert.equal(res.statusCode, 401)
  })
}

test('agent-chat still rejects non-POST once authenticated', async () => {
  process.env.KAIROS_USER = 'u'
  process.env.KAIROS_PASS = 'p'
  const encoded = Buffer.from('u:p').toString('base64')
  const req = { method: 'GET', headers: { authorization: `Basic ${encoded}` }, query: { route: 'agent-chat' } }
  const res = fakeRes()
  await handler(req, res)
  assert.equal(res.statusCode, 405)
  delete process.env.KAIROS_USER
  delete process.env.KAIROS_PASS
})
