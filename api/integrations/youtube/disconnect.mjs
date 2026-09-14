// POST /api/integrations/youtube/disconnect — o Founder revogando a conexão
// que ele mesmo autorizou. Só apaga a linha cifrada deste lado; não chama a
// API do Google para revogar o token remotamente (fica documentado como
// próximo passo, não fingido como feito).
import { checkAuth, unauthorized } from '../../_auth.js'
import { disconnectYoutube } from '../../_youtube.js'

export default async function handler(req, res) {
  if (!checkAuth(req)) return unauthorized(res)
  res.setHeader('Cache-Control', 'no-store')

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ erro: 'use POST' })
  }

  try {
    return res.status(200).json(await disconnectYoutube())
  } catch (e) {
    return res.status(e.status || 500).json({ erro: e.message })
  }
}
