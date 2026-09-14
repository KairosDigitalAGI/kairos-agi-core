// POST /api/agent-chat — chat com um agente do organograma. Mesma Basic Auth
// de business-metrics/agent-status (expõe dado financeiro real no prompt e
// custa dinheiro real por mensagem). Lógica em api/_agent-chat.js.
import { checkAuth, unauthorized } from './_auth.js'
import { handleAgentChat } from './_agent-chat.js'

export default async function handler(req, res) {
  if (!checkAuth(req)) return unauthorized(res)
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ erro: 'use POST' })
  }
  res.setHeader('Cache-Control', 'no-store')
  const out = await handleAgentChat({ body: req.body })
  return res.status(out.status).json(out.body)
}
