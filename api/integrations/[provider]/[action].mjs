// Função dinâmica única para os OAuth sociais. Mantém o Core abaixo do
// limite de Serverless Functions do plano Vercel Hobby.
import { checkAuth, unauthorized } from '../../_auth.js'
import { buildConnectUrl, completeConnection, computeYoutubeStatus, disconnectYoutube } from '../../_youtube.js'
import {
  buildInstagramConnectUrl,
  completeInstagramConnection,
  computeInstagramStatus,
  disconnectInstagram,
  getAutomationConfig,
  upsertAutomationConfig,
  listAutomationLogs,
} from '../../_instagram.js'

const providers = {
  youtube: { build: buildConnectUrl, complete: completeConnection, status: computeYoutubeStatus, disconnect: disconnectYoutube },
  instagram: { build: buildInstagramConnectUrl, complete: completeInstagramConnection, status: computeInstagramStatus, disconnect: disconnectInstagram },
}

function callback(req, res, provider, adapter) {
  const url = new URL(req.url, 'http://localhost')
  const error = url.searchParams.get('error')
  if (error) {
    res.setHeader('Location', `/?module=integrations&${provider}=error&reason=${encodeURIComponent(`O provedor recusou: ${error}`)}`)
    return res.status(302).end()
  }
  return Promise.resolve(adapter.complete({ code: url.searchParams.get('code'), state: url.searchParams.get('state') }))
    .then(() => {
      res.setHeader('Location', `/?module=integrations&${provider}=connected`)
      return res.status(302).end()
    })
    .catch(errorCaught => {
      res.setHeader('Location', `/?module=integrations&${provider}=error&reason=${encodeURIComponent(errorCaught.message)}`)
      return res.status(302).end()
    })
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  const provider = String(req.query?.provider || '')
  const action = String(req.query?.action || '')
  const adapter = providers[provider]
  if (!adapter) return res.status(404).json({ erro: 'provedor não suportado' })

  if (action === 'callback') {
    if (req.method !== 'GET') return res.status(405).json({ erro: 'use GET' })
    return callback(req, res, provider, adapter)
  }
  if (!checkAuth(req)) return unauthorized(res)
  try {
    if (action === 'auth-check' && req.method === 'GET') return res.status(200).json({ ok: true })
    if (action === 'connect-url' && req.method === 'GET') return res.status(200).json({ url: adapter.build() })
    if (action === 'status' && req.method === 'GET') return res.status(200).json(await adapter.status())
    if (action === 'disconnect' && req.method === 'POST') return res.status(200).json(await adapter.disconnect())

    // Automação Instagram (só faz sentido para instagram, mas o guard de provider não precisa ser explícito
    // porque o webhook.mjs estático já intercepta as chamadas de evento antes de chegar aqui)
    if (provider === 'instagram') {
      if (action === 'automation-config' && req.method === 'GET') return res.status(200).json(await getAutomationConfig())
      if (action === 'automation-config' && req.method === 'POST') {
        const body = req.body || {}
        await upsertAutomationConfig({ enabled: body.enabled, promptBase: body.promptBase })
        return res.status(200).json(await getAutomationConfig())
      }
      if (action === 'automation-logs' && req.method === 'GET') return res.status(200).json({ logs: await listAutomationLogs() })
    }

    return res.status(405).json({ erro: 'método ou ação inválida' })
  } catch (e) {
    return res.status(e.status || 500).json({ erro: e.message })
  }
}
