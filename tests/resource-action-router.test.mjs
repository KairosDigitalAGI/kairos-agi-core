import test from 'node:test'
import assert from 'node:assert/strict'
import handler from '../api/[resource]/[action].mjs'

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

function authedReq(overrides) {
  process.env.KAIROS_USER = 'u'
  process.env.KAIROS_PASS = 'p'
  const encoded = Buffer.from('u:p').toString('base64')
  return { headers: { authorization: `Basic ${encoded}` }, ...overrides }
}

test('every resource/action route requires Basic Auth before dispatch', async () => {
  delete process.env.KAIROS_USER
  delete process.env.KAIROS_PASS
  for (const [resource, action] of [['avatars', 'list'], ['story', 'activity'], ['content-jobs', 'approve']]) {
    const req = { method: 'GET', headers: {}, query: { resource, action } }
    const res = fakeRes()
    await handler(req, res)
    assert.equal(res.statusCode, 401, `${resource}/${action} should fail closed`)
  }
})

test('unknown resource is a 404, unrelated to which actions exist on other resources', async () => {
  const req = authedReq({ method: 'GET', query: { resource: 'ghost', action: 'list' } })
  const res = fakeRes()
  await handler(req, res)
  assert.equal(res.statusCode, 404)
})

test('known resource with unknown action is a 404', async () => {
  const req = authedReq({ method: 'GET', query: { resource: 'avatars', action: 'delete-everything' } })
  const res = fakeRes()
  await handler(req, res)
  assert.equal(res.statusCode, 404)
})

test('content-jobs/approve still requires jobId in the body, same as before consolidation', async () => {
  const req = authedReq({ method: 'POST', body: {}, query: { resource: 'content-jobs', action: 'approve' } })
  const res = fakeRes()
  await handler(req, res)
  assert.equal(res.statusCode, 400)
  assert.match(res.body.erro, /jobId/)
})

test('story/narrative rejects GET (still POST-only)', async () => {
  const req = authedReq({ method: 'GET', query: { resource: 'story', action: 'narrative' } })
  const res = fakeRes()
  await handler(req, res)
  assert.equal(res.statusCode, 405)
})

test('avatars/list rejects POST (still GET-only)', async () => {
  const req = authedReq({ method: 'POST', query: { resource: 'avatars', action: 'list' } })
  const res = fakeRes()
  await handler(req, res)
  assert.equal(res.statusCode, 405)
})
