import { computeSeedanceReadiness } from './_content.js'

// GET /api/content-readiness — estado sanitizado de pré-voo. Não expõe
// credenciais nem cria recursos; pode ser aberto no Studio sem Basic Auth.
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ erro: 'use GET' })
  }
  res.setHeader('Cache-Control', 'no-store')
  try { return res.status(200).json(await computeSeedanceReadiness()) }
  catch { return res.status(200).json({ checkedAt: new Date().toISOString(), model: 'bytedance/seedance-2.5', contentStoreReady: false, storageReady: false, featureEnabled: false, gatewayAuthenticated: false, requiresApprovedJob: true, budgetCapUsd: 5 }) }
}
