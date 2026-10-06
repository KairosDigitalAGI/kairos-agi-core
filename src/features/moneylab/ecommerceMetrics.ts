export type EcommerceMetricRow = {
  date: string
  clicks: number
  orders: number
  salesBrl: number
  commissionBrl: number
  cancellations: number
}

export type EcommerceMetricBatch = {
  id: string
  sourceLabel: string
  importedAt: string
  rows: EcommerceMetricRow[]
}

export const ECOMMERCE_METRICS_KEY = 'kairos.moneylab.ecommerce.metrics.v1'
export const METRICS_HEADER = 'date,clicks,orders,sales_brl,commission_brl,cancellations'

function parseCsvLine(line: string) {
  const cells: string[] = []
  let cell = ''
  let quoted = false
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index]
    if (char === '"' && quoted && line[index + 1] === '"') { cell += '"'; index += 1 }
    else if (char === '"') quoted = !quoted
    else if (char === ',' && !quoted) { cells.push(cell.trim()); cell = '' }
    else cell += char
  }
  if (quoted) throw new Error('CSV possui aspas não fechadas.')
  cells.push(cell.trim())
  return cells
}

function finiteNonNegative(value: string, field: string, line: number) {
  if (value === '') throw new Error(`Linha ${line}: ${field} está vazio.`)
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 0) throw new Error(`Linha ${line}: ${field} deve ser um número não negativo.`)
  return parsed
}

export function parseMetricsCsv(csv: string) {
  const lines = csv.replace(/^\uFEFF/, '').split(/\r?\n/).map(line => line.trim()).filter(Boolean)
  if (lines.length < 2) throw new Error('Inclua o cabeçalho e pelo menos uma linha de métricas reais.')
  if (lines[0].toLowerCase() !== METRICS_HEADER) throw new Error(`Cabeçalho esperado: ${METRICS_HEADER}`)
  if (lines.length > 366) throw new Error('Importe no máximo 365 linhas por lote.')
  return lines.slice(1).map((line, index): EcommerceMetricRow => {
    const number = index + 2
    const cells = parseCsvLine(line)
    if (cells.length !== 6) throw new Error(`Linha ${number}: esperadas 6 colunas.`)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(cells[0]) || Number.isNaN(Date.parse(`${cells[0]}T00:00:00Z`))) throw new Error(`Linha ${number}: data inválida.`)
    return {
      date: cells[0],
      clicks: finiteNonNegative(cells[1], 'clicks', number),
      orders: finiteNonNegative(cells[2], 'orders', number),
      salesBrl: finiteNonNegative(cells[3], 'sales_brl', number),
      commissionBrl: finiteNonNegative(cells[4], 'commission_brl', number),
      cancellations: finiteNonNegative(cells[5], 'cancellations', number),
    }
  })
}

export function createMetricBatch(csv: string, sourceLabel: string, now = new Date()): EcommerceMetricBatch {
  if (sourceLabel.trim().length < 3) throw new Error('Informe o nome do relatório oficial usado como fonte.')
  return { id: `metrics-${now.getTime()}`, sourceLabel: sourceLabel.trim(), importedAt: now.toISOString(), rows: parseMetricsCsv(csv) }
}

export function summarizeMetrics(batches: EcommerceMetricBatch[]) {
  const rows = batches.flatMap(batch => batch.rows)
  if (rows.length === 0) return null
  const total = rows.reduce((sum, row) => ({ clicks: sum.clicks + row.clicks, orders: sum.orders + row.orders, salesBrl: sum.salesBrl + row.salesBrl, commissionBrl: sum.commissionBrl + row.commissionBrl, cancellations: sum.cancellations + row.cancellations }), { clicks: 0, orders: 0, salesBrl: 0, commissionBrl: 0, cancellations: 0 })
  return { ...total, conversionPct: total.clicks > 0 ? total.orders / total.clicks * 100 : null, rows: rows.length }
}

export function loadMetricBatches(storage: Pick<Storage, 'getItem'> = localStorage): EcommerceMetricBatch[] {
  try {
    const parsed = JSON.parse(storage.getItem(ECOMMERCE_METRICS_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter(batch => batch && typeof batch.id === 'string' && typeof batch.sourceLabel === 'string' && Array.isArray(batch.rows)) : []
  } catch { return [] }
}

export function saveMetricBatches(batches: EcommerceMetricBatch[], storage: Pick<Storage, 'setItem'> = localStorage) {
  storage.setItem(ECOMMERCE_METRICS_KEY, JSON.stringify(batches.slice(0, 12)))
}
