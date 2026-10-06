import test from 'node:test'
import assert from 'node:assert/strict'
import { createMetricBatch, parseMetricsCsv, summarizeMetrics } from '../src/features/moneylab/ecommerceMetrics.ts'

const header = 'date,clicks,orders,sales_brl,commission_brl,cancellations'

test('metrics import requires exact schema and explicit values', () => {
  assert.throws(() => parseMetricsCsv('date,clicks\n2026-10-05,2'), /Cabeçalho esperado/)
  assert.throws(() => parseMetricsCsv(`${header}\n2026-10-05,,1,100,8,0`), /está vazio/)
  assert.throws(() => parseMetricsCsv(`${header}\n2026-10-05,-1,1,100,8,0`), /não negativo/)
})

test('metrics summary uses only imported rows and preserves legitimate zero', () => {
  const batch = createMetricBatch(`${header}\n2026-10-05,10,2,200,16,1\n2026-10-06,0,0,0,0,0`, 'relatorio-oficial.csv', new Date('2026-10-06T12:00:00Z'))
  const summary = summarizeMetrics([batch])
  assert.deepEqual(summary, { clicks: 10, orders: 2, salesBrl: 200, commissionBrl: 16, cancellations: 1, conversionPct: 20, rows: 2 })
})

test('metrics remain unavailable without a real imported row', () => {
  assert.equal(summarizeMetrics([]), null)
})
