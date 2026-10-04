export type CatalogStatus = 'rascunho' | 'verificado' | 'rejeitado'

export type CatalogCandidate = {
  id: string
  title: string
  productUrl: string
  priceBrl: number
  commissionPct: number
  sourceCheckedAt: string
  evidenceNote: string
  status: CatalogStatus
  createdAt: string
}

export type CatalogDraft = Omit<CatalogCandidate, 'id' | 'status' | 'createdAt'>

export const ECOMMERCE_CATALOG_KEY = 'kairos.moneylab.ecommerce.catalog.v1'

export function validateCatalogDraft(draft: CatalogDraft) {
  const errors: string[] = []
  if (draft.title.trim().length < 3) errors.push('Informe o nome real do produto.')
  try {
    const url = new URL(draft.productUrl)
    if (url.protocol !== 'https:' || !/(^|\.)mercadolivre\.com\.br$/i.test(url.hostname)) errors.push('Use uma URL oficial do Mercado Livre Brasil.')
  } catch { errors.push('Informe uma URL válida do produto.') }
  if (!Number.isFinite(draft.priceBrl) || draft.priceBrl <= 0) errors.push('Informe o preço observado, maior que zero.')
  if (!Number.isFinite(draft.commissionPct) || draft.commissionPct <= 0 || draft.commissionPct > 100) errors.push('Informe a comissão observada entre 0 e 100%.')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.sourceCheckedAt)) errors.push('Informe a data da conferência.')
  if (draft.evidenceNote.trim().length < 10) errors.push('Registre onde a elegibilidade e a comissão foram conferidas.')
  return errors
}

export function createCatalogCandidate(draft: CatalogDraft, now = new Date()): CatalogCandidate {
  const errors = validateCatalogDraft(draft)
  if (errors.length) throw new Error(errors.join(' '))
  return { ...draft, title: draft.title.trim(), productUrl: draft.productUrl.trim(), evidenceNote: draft.evidenceNote.trim(), id: `ml-${now.getTime()}`, status: 'rascunho', createdAt: now.toISOString() }
}

export function estimateGrossCommission(candidate: CatalogCandidate) {
  return candidate.priceBrl * candidate.commissionPct / 100
}

export function buildEditorialBrief(candidate: CatalogCandidate) {
  if (candidate.status !== 'verificado') throw new Error('Verifique a fonte antes de preparar o briefing editorial.')
  return `Produto: ${candidate.title}\nOferta observada: ${candidate.priceBrl.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\nÂngulo: demonstrar um problema real e como o produto ajuda, sem prometer resultado nem inventar características.\nCTA: usar somente o link oficial de afiliado gerado pela plataforma.\nTransparência: identificar o conteúdo como publicidade/afiliado conforme a regra do canal.\nEvidência: ${candidate.evidenceNote} (conferida em ${candidate.sourceCheckedAt}).`
}

export function loadCatalog(storage: Pick<Storage, 'getItem'> = localStorage): CatalogCandidate[] {
  try {
    const parsed = JSON.parse(storage.getItem(ECOMMERCE_CATALOG_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter(item => item && typeof item.id === 'string' && validateCatalogDraft(item).length === 0) : []
  } catch { return [] }
}

export function saveCatalog(items: CatalogCandidate[], storage: Pick<Storage, 'setItem'> = localStorage) {
  storage.setItem(ECOMMERCE_CATALOG_KEY, JSON.stringify(items.slice(0, 50)))
}
