// Função dinâmica única para os OAuth sociais. Mantém o Core abaixo do
// limite de Serverless Functions do plano Vercel Hobby.
import { checkAuth, unauthorized } from '../../_auth.js'
import { buildConnectUrl, completeConnection, computeYoutubeStatus, disconnectYoutube } from '../../_youtube.js'
import { buildInstagramConnectUrl, completeInstagramConnection, computeInstagramStatus, disconnectInstagram, getValidInstagramAccess, subscribeInstagramWebhook } from '../../_instagram.js'
import { handleInstagramWebhook, readWebhookBody, listInstagramInbox, createInstagramRule, setInstagramRuleEnabled, replyToInstagramEvent } from '../../_instagramEngagement.js'

// A assinatura da Meta exige os bytes originais, antes de JSON.parse.
export const config = { api: { bodyParser: false } }

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

  if (provider === 'instagram' && action === 'webhook') return handleInstagramWebhook(req, res)

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
    if (provider === 'instagram' && action === 'inbox' && req.method === 'GET') return res.status(200).json(await listInstagramInbox())
    if (provider === 'instagram' && action === 'subscribe-webhook' && req.method === 'POST') {
      const { accessToken, igUserId } = await getValidInstagramAccess()
      return res.status(200).json(await subscribeInstagramWebhook(accessToken, igUserId))
    }
    if (provider === 'instagram' && ['rule', 'rule-toggle', 'reply'].includes(action) && req.method === 'POST') {
      const raw = await readWebhookBody(req)
      if (raw.length > 4096) return res.status(413).json({ erro: 'Requisição acima do limite.' })
      let input
      try { input = JSON.parse(raw.toString('utf8')) } catch { return res.status(400).json({ erro: 'JSON inválido.' }) }
      if (action === 'rule') return res.status(200).json(await createInstagramRule(input))
      if (action === 'rule-toggle') return res.status(200).json(await setInstagramRuleEnabled(input))
      return res.status(200).json(await replyToInstagramEvent(input))
    }
    return res.status(405).json({ erro: 'método ou ação inválida' })
  } catch (e) {
    return res.status(e.status || 500).json({ erro: e.message })
  }
}
