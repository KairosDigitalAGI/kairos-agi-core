// GET /api/integrations/youtube/connect-url — devolve a URL de consentimento
// do Google para o Founder abrir. Atrás da mesma Basic Auth do Painel
// Operacional: só quem já desbloqueou o painel pode iniciar uma conexão.
import { checkAuth, unauthorized } from '../../_auth.js'
import { buildConnectUrl } from '../../_youtube.js'

export default function handler(req, res) {
  if (!checkAuth(req)) return unauthorized(res)
  res.setHeader('Cache-Control', 'no-store')

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ erro: 'use GET' })
  }

  try {
    return res.status(200).json({ url: buildConnectUrl() })
  } catch (e) {
    return res.status(e.status || 500).json({ erro: e.message })
  }
}
