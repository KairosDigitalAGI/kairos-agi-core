import test from 'node:test'
import assert from 'node:assert/strict'
import { buildEditorialBrief, createCatalogCandidate, estimateGrossCommission, validateCatalogDraft } from '../src/features/moneylab/ecommerceCatalog.ts'

const draft = { title: 'Produto observado', productUrl: 'https://produto.mercadolivre.com.br/MLB-123', priceBrl: 100, commissionPct: 8, sourceCheckedAt: '2026-10-04', evidenceNote: 'Elegível na central oficial do afiliado.' }

test('catalog rejects unknown hosts and invented zero values', () => {
  assert.ok(validateCatalogDraft({ ...draft, productUrl: 'https://example.com/item' }).length)
  assert.ok(validateCatalogDraft({ ...draft, priceBrl: 0 }).length)
  assert.ok(validateCatalogDraft({ ...draft, commissionPct: 0 }).length)
})

test('catalog computes only the gross observed commission', () => {
  const candidate = createCatalogCandidate(draft, new Date('2026-10-04T12:00:00Z'))
  assert.equal(candidate.status, 'rascunho')
  assert.equal(estimateGrossCommission(candidate), 8)
})

test('editorial brief requires explicit verification', () => {
  const candidate = createCatalogCandidate(draft)
  assert.throws(() => buildEditorialBrief(candidate), /Verifique a fonte/)
  const brief = buildEditorialBrief({ ...candidate, status: 'verificado' })
  assert.match(brief, /publicidade\/afiliado/)
  assert.match(brief, /link oficial/)
})
