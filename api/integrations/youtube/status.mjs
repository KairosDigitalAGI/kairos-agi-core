// GET /api/integrations/youtube/status — estado real da conexão (canal
// conectado, validade do token), nunca o token em si. Atrás da Basic Auth do
// Painel Operacional: diferente de /api/integrations/status (que só expõe
// booleano de configuração e fica sem guarda de propósito), aqui já é dado
// de negócio real — qual canal está conectado — então exige a mesma
// credencial das outras rotas reais deste Core.
import { checkAuth, unauthorized } from '../../_auth.js'
import { computeYoutubeStatus } from '../../_youtube.js'

export default async function handler(req, res) {
  if (!checkAuth(req)) return unauthorized(res)
  res.setHeader('Cache-Control', 'no-store')

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ erro: 'use GET' })
  }

  return res.status(200).json(await computeYoutubeStatus())
}
