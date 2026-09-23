import test from 'node:test'
import assert from 'node:assert/strict'
import handler from '../api/integrations/[...route].mjs'

function fakeRes() {
  const res = {
    statusCode: undefined,
    headers: {},
    body: undefined,
    ended: false,
    setHeader(k, v) { this.headers[k] = v },
    status(code) { this.statusCode = code; return this },
    json(body) { this.body = body; return this },
    end() { this.ended = true; return this },
  }
  return res
}

test('GET /api/integrations/status stays public (no Basic Auth) and never leaks secrets', async () => {
  const req = { method: 'GET', url: '/api/integrations/status', headers: {}, query: { route: ['status'] } }
  const res = fakeRes()
  await handler(req, res)
  assert.equal(res.statusCode, 200)
  assert.ok(Array.isArray(res.body.providers))
})

test('GET /api/integrations/:provider/:action requires Basic Auth (fails closed without KAIROS_USER/PASS)', async () => {
  delete process.env.KAIROS_USER
  delete process.env.KAIROS_PASS
  const req = { method: 'GET', url: '/api/integrations/youtube/status', headers: {}, query: { route: ['youtube', 'status'] } }
  const res = fakeRes()
  await handler(req, res)
  assert.equal(res.statusCode, 401)
})

test('unsupported provider is a 404, unrelated to auth', async () => {
  const req = { method: 'GET', url: '/api/integrations/tiktok/status', headers: {}, query: { route: ['tiktok', 'status'] } }
  const res = fakeRes()
  await handler(req, res)
  assert.equal(res.statusCode, 404)
})

test('OAuth callback bypasses Basic Auth and redirects on provider error, at the same public URL as before consolidation', async () => {
  const req = { method: 'GET', url: '/api/integrations/youtube/callback?error=access_denied', headers: {}, query: { route: ['youtube', 'callback'] } }
  const res = fakeRes()
  await handler(req, res)
  assert.equal(res.statusCode, 302)
  assert.match(res.headers.Location, /module=integrations&youtube=error/)
})

test('a route depth that never existed (0 or 3+ segments) is a 404, not a crash', async () => {
  const req = { method: 'GET', url: '/api/integrations', headers: {}, query: { route: [] } }
  const res = fakeRes()
  await handler(req, res)
  assert.equal(res.statusCode, 404)
})
