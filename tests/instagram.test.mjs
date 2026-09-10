import test from 'node:test'
import assert from 'node:assert/strict'
import { editorialReducer, emptyDraft, parseEditorial, nextStepError, pipeline } from '../src/engines/instagram/domain.ts'
import { editorialSeed } from '../src/data/mock/editorial.ts'
import { disconnectedGateway } from '../src/engines/instagram/graphGateway.ts'
const at = '2026-09-10T22:00:00Z'
const makeState = () => structuredClone(editorialSeed)
test('ideas require a title and theme', () => {
  const s = makeState()
  assert.equal(editorialReducer(s, { type: 'save', id: 'new', draft: emptyDraft, at }), s)
})
test('pipeline cannot skip incomplete material or the approval gate', () => {
  let s = makeState()
  const draft = { ...emptyDraft, title: 'Teste', theme: 'Educação' }
  s = editorialReducer(s, { type: 'save', id: 'new', draft, at })
  s = editorialReducer(s, { type: 'advance', id: 'new', at })
  assert.equal(s.items.find(i => i.id === 'new').stage, 'Pesquisa')
  assert.equal(editorialReducer(s, { type: 'advance', id: 'new', at }), s)
  const waiting = s.items.find(i => i.id === 'IG-001')
  assert.ok(nextStepError(waiting))
  assert.equal(editorialReducer(s, { type: 'advance', id: waiting.id, at }), s)
})
test('founder approval is versioned and does not publish', () => {
  const s = editorialReducer(makeState(), { type: 'approve', id: 'IG-001', at })
  const item = s.items[0]
  assert.equal(item.stage, 'Publicação')
  assert.equal(item.approvedRevision, item.revision)
  assert.match(nextStepError(item), /sem publicar/)
  assert.equal(editorialReducer(s, { type: 'approve', id: item.id, at }), s)
})
test('editing approved content invalidates approval and returns to caption', () => {
  let s = editorialReducer(makeState(), { type: 'approve', id: 'IG-001', at })
  s = editorialReducer(s, { type: 'save', id: 'IG-001', draft: { ...s.items[0], caption: 'Nova legenda' }, at })
  assert.equal(s.items[0].approval, 'Pendente')
  assert.equal(s.items[0].approvedRevision, null)
  assert.equal(s.items[0].stage, 'Legenda')
  assert.equal(s.items[0].revision, 2)
})
test('revision requires feedback and returns to script', () => {
  const s = makeState()
  assert.equal(editorialReducer(s, { type: 'revise', id: 'IG-001', at, feedback: ' ' }), s)
  const result = editorialReducer(s, { type: 'revise', id: 'IG-001', at, feedback: 'Ajustar gancho' })
  assert.equal(result.items[0].stage, 'Roteiro')
  assert.equal(result.items[0].feedback, 'Ajustar gancho')
})
test('incomplete material cannot be approved', () => {
  const s = makeState(); s.items[0].caption = ''
  assert.equal(editorialReducer(s, { type: 'approve', id: 'IG-001', at }), s)
})
test('prompt updates reuse the id without duplication', () => {
  const s = makeState()
  const result = editorialReducer(s, { type: 'prompt', prompt: { ...s.prompts[0], body: 'Atualizado' } })
  assert.equal(result.prompts.length, s.prompts.length)
  assert.equal(result.prompts.find(p => p.id === s.prompts[0].id).body, 'Atualizado')
})
test('saved data round trips; malformed data and unapproved publication are rejected', () => {
  const s = makeState()
  assert.deepEqual(parseEditorial(JSON.stringify(s)), s)
  for (const raw of ['null', '{}', '{', '{"version":2,"items":[],"prompts":[]}']) assert.throws(() => parseEditorial(raw))
  s.items[0].stage = 'Publicação'
  assert.throws(() => parseEditorial(JSON.stringify(s)))
})
test('complete pipeline reaches approval sequentially and retains audit trail', () => {
  let s = makeState(); s.items[0].stage = 'Ideia'
  for (const expected of pipeline.slice(1, -1)) {
    s = editorialReducer(s, { type: 'advance', id: 'IG-001', at })
    assert.equal(s.items[0].stage, expected)
  }
  assert.equal(s.items[0].history.length, 6)
})
test('future Graph API adapter fails closed without network calls', async () => {
  assert.equal(disconnectedGateway.connected, false)
  await assert.rejects(disconnectedGateway.publish(editorialSeed.items[0]), /Nenhum conteúdo foi publicado/)
})
