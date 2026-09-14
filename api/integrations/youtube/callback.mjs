// GET /api/integrations/youtube/callback — para onde o Google redireciona
// depois do consentimento. NÃO fica atrás da Basic Auth do painel: o Google
// não consegue mandar esse header no redirect do navegador. A prova de que
// isso veio de um `connect-url` gerado por este backend é o `state` assinado
// (HMAC + janela de 10 min, ver api/_crypto.js) — não a credencial.
//
// Nunca devolve token nem código no redirect de volta: só um sinal de
// sucesso/erro em query string, pro painel mostrar um aviso.
import { completeConnection } from '../../_youtube.js'

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')

  const url = new URL(req.url, 'http://localhost')
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const erroGoogle = url.searchParams.get('error')

  if (erroGoogle) {
    res.setHeader('Location', `/?module=integrations&youtube=error&reason=${encodeURIComponent(`O Google recusou: ${erroGoogle}`)}`)
    return res.status(302).end()
  }

  try {
    await completeConnection({ code, state })
    res.setHeader('Location', '/?module=integrations&youtube=connected')
    return res.status(302).end()
  } catch (e) {
    res.setHeader('Location', `/?module=integrations&youtube=error&reason=${encodeURIComponent(e.message)}`)
    return res.status(302).end()
  }
}
