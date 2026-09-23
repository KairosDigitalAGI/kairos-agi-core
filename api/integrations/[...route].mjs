// Rota catch-all para todo o domínio /api/integrations. Consolidação de
// arquivo, não de comportamento: fundiu api/integrations/status.mjs e
// api/integrations/[provider]/[action].mjs neste único arquivo pra liberar
// slots no teto de 12 Serverless Functions do plano Hobby da Vercel antes do
// Estúdio Kairos (Fase 14) precisar de rotas novas. Cada URL pública mantém
// exatamente o mesmo path, validação, Basic Auth e resposta — incluindo os
// callbacks OAuth do YouTube e do Instagram, cujo redirect_uri está
// registrado nos apps dos provedores e não pode mudar. Lógica de negócio
// segue em api/_integrations.js, api/_youtube.js e api/_instagram.js.
// Fase 17 somou a ação 'auto-reply' (GET/POST) para o interruptor de
// rascunho de resposta por IA do webhook do Instagram — o webhook em si
// (recepção real da Meta) é um arquivo físico separado, ver
// api/integrations/instagram-webhook.mjs, por exigir corpo bruto.
import { checkAuth, unauthorized } from '../_auth.js'
import { readIntegrationStatus } from '../_integrations.js'
import { buildConnectUrl, completeConnection, computeYoutubeStatus, disconnectYoutube } from '../_youtube.js'
import { buildInstagramConnectUrl, completeInstagramConnection, computeInstagramStatus, disconnectInstagram } from '../_instagram.js'
import { getAutoReplyEnabled, setAutoReplyEnabled } from '../_instagram_webhook.js'

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
  const route = Array.isArray(req.query?.route) ? req.query.route : []

  // GET /api/integrations/status — sem Basic Auth de propósito, ver api/_integrations.js
  if (route.length === 1 && route[0] === 'status') {
    return res.status(200).json(readIntegrationStatus())
  }

  // /api/integrations/:provider/:action — OAuth do YouTube e do Instagram
  if (route.length === 2) {
    const [provider, action] = route
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
      // Interruptor de rascunho de resposta por IA (Fase 17) — UI toggle
      // OFF por padrão, só existe de verdade para 'instagram' hoje.
      if (action === 'auto-reply' && req.method === 'GET') return res.status(200).json(await getAutoReplyEnabled(provider))
      if (action === 'auto-reply' && req.method === 'POST') return res.status(200).json(await setAutoReplyEnabled({ provider, enabled: Boolean(req.body?.enabled) }))
      return res.status(405).json({ erro: 'método ou ação inválida' })
    } catch (e) {
      return res.status(e.status || 500).json({ erro: e.message })
    }
  }

  return res.status(404).json({ erro: 'rota desconhecida' })
}
