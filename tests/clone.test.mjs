import test from 'node:test'
import assert from 'node:assert/strict'
import { cloneReducer, emptyClone, emptyCloneDraft, parseClone, clonePipeline } from '../src/engines/clone/domain.ts'
import { videoProviders } from '../src/engines/clone/videoProvider.ts'
import { migrateLegacyEditorial } from '../src/core/editorialMigration.ts'
import { editorialSeed } from '../src/data/mock/editorial.ts'
const at = '2026-09-11T00:00:00Z'
function prepared() {
  let s = structuredClone(emptyClone)
  for (const record of [
    { id: 'identity', kind: 'identity', name: 'Titular de teste', fields: { owner: 'Teste', context: 'Teste unitário', consent: 'Autorizado', evidence: 'Autorização de teste' } },
    { id: 'prompt', kind: 'prompt', name: 'Prompt de teste', fields: { objective: 'Teste', input: 'Tema', output: 'Texto', engine: 'manual', category: 'Teste', body: 'Texto de teste' } },
    ...['Imagem', 'Vídeo', 'Thumbnail'].map(type => ({ id: type, kind: 'asset', name: type, fields: { type, reference: 'fixture local', rights: 'Somente teste' } })),
  ]) s = cloneReducer(s, { type: 'record', ...record, at })
  return cloneReducer(s, { type: 'save', id: 'v', draft: { ...emptyCloneDraft, title: 'Teste', identityId: 'identity', promptId: 'prompt', script: 'Roteiro', caption: 'Legenda', imageAssetId: 'Imagem', videoAssetId: 'Vídeo', thumbnailAssetId: 'Thumbnail' }, at })
}
function awaitingApproval() { let s = prepared(); for (let i = 0; i < 7; i++) s = cloneReducer(s, { type: 'advance', id: 'v', at }); return s }
test('clone starts empty and refuses missing consent and unfinished material', () => {
  assert.deepEqual(emptyClone.records, []); assert.deepEqual(emptyClone.videos, [])
  let s = cloneReducer(emptyClone, { type: 'save', id: 'v', draft: { ...emptyCloneDraft, title: 'Teste' }, at })
  assert.equal(cloneReducer(s, { type: 'advance', id: 'v', at }), s)
  s = prepared(); s.videos[0].script = ''
  s = cloneReducer(s, { type: 'advance', id: 'v', at })
  assert.equal(s.videos[0].stage, 'Roteiro')
  assert.equal(cloneReducer(s, { type: 'advance', id: 'v', at }), s)
})
test('each pipeline step is sequential, approval never publishes', () => {
  let s = prepared()
  for (const stage of clonePipeline.slice(1, -1)) { s = cloneReducer(s, { type: 'advance', id: 'v', at }); assert.equal(s.videos[0].stage, stage) }
  assert.equal(cloneReducer(s, { type: 'advance', id: 'v', at }), s)
  s = cloneReducer(s, { type: 'approve', id: 'v', at })
  assert.equal(s.videos[0].approvedRevision, 1)
  assert.equal(s.videos[0].approvedLibraryRevision, s.libraryRevision)
  assert.equal(cloneReducer(s, { type: 'advance', id: 'v', at }), s)
})
test('changing materials or revoking consent invalidates approval', () => {
  let s = cloneReducer(awaitingApproval(), { type: 'approve', id: 'v', at })
  const identity = s.records.find(r => r.id === 'identity')
  s = cloneReducer(s, { type: 'record', ...identity, fields: { ...identity.fields, consent: 'Revogado' }, at })
  assert.equal(s.videos[0].approvedRevision, null)
  s.videos[0].stage = 'Aprovação Founder'
  assert.equal(cloneReducer(s, { type: 'approve', id: 'v', at }), s)
})
test('edits reset steps; revision requires actionable feedback', () => {
  const s = awaitingApproval()
  assert.equal(cloneReducer(s, { type: 'revise', id: 'v', feedback: ' ', at }), s)
  assert.equal(cloneReducer(s, { type: 'revise', id: 'v', feedback: 'Corrigir legenda', at }).videos[0].stage, 'Roteiro')
  const approved = cloneReducer(s, { type: 'approve', id: 'v', at })
  const edited = cloneReducer(approved, { type: 'save', id: 'v', draft: { ...approved.videos[0], caption: 'Nova' }, at })
  assert.equal(edited.videos[0].revision, 2); assert.equal(edited.videos[0].stage, 'Ideia'); assert.equal(edited.videos[0].approvedRevision, null)
})
test('corrupt persistence, stale approvals and incorrect asset types are rejected', () => {
  assert.deepEqual(parseClone(JSON.stringify(prepared())), prepared())
  for (const raw of ['null', '{}', '{', JSON.stringify({ ...emptyClone, edition: 'client' })]) assert.throws(() => parseClone(raw))
  const stale = cloneReducer(awaitingApproval(), { type: 'approve', id: 'v', at }); stale.libraryRevision++
  assert.throws(() => parseClone(JSON.stringify(stale)))
  const s = awaitingApproval(); s.videos[0].videoAssetId = 'Imagem'
  assert.equal(cloneReducer(s, { type: 'approve', id: 'v', at }), s)
})
test('all providers fail closed without generation or spending', async () => {
  for (const provider of videoProviders) { assert.equal(provider.connected, false); await assert.rejects(provider.generate({}), /Nenhuma geração, cobrança ou publicação/) }
})
test('legacy examples are quarantined while user records survive migration', () => {
  const legacy = structuredClone(editorialSeed)
  legacy.items.push({ ...legacy.items[0], id: 'user-created', title: 'Conteúdo cadastrado' })
  legacy.items[0].title = 'Exemplo editado'
  const migrated = migrateLegacyEditorial(legacy)
  assert.deepEqual(migrated.items.map(i => i.id), ['user-created'])
  assert.equal(legacy.items.length, 4)
  assert.equal(legacy.items[0].title, 'Exemplo editado')
})
