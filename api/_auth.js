// Basic Auth para as rotas do Core que expõem dado real (receita, frota).
// Padrão herdado do kairos-os (api/_auth.js) — mesma lógica, credenciais
// PRÓPRIAS deste projeto (KAIROS_USER/KAIROS_PASS na Vercel do kairos-agi-core,
// nunca as mesmas do kairos-os). Fail-closed: env ausente ou incompleta ⇒
// ninguém entra. Trancar é preferível a vazar receita.
//
// /api/integrations/status não usa este guard de propósito: só devolve
// booleanos de configuração, nunca segredo nem número de negócio.
import { createHash, timingSafeEqual } from 'node:crypto'

const digest = (v) => createHash('sha256').update(String(v), 'utf8').digest()
const equals = (a, b) => timingSafeEqual(digest(a), digest(b))

export function checkAuth(req) {
  const user = process.env.KAIROS_USER
  const pass = process.env.KAIROS_PASS
  if (!user || !pass) return false

  const header = (req.headers && (req.headers.authorization || req.headers.Authorization)) || ''
  const [scheme, encoded] = String(header).split(' ')
  if (!encoded || String(scheme).toLowerCase() !== 'basic') return false

  let decoded
  try {
    decoded = Buffer.from(encoded, 'base64').toString('utf8')
  } catch {
    return false
  }

  const sep = decoded.indexOf(':')
  if (sep < 0) return false

  // Sem short-circuit: as duas comparações sempre rodam (tempo constante).
  const okUser = equals(decoded.slice(0, sep), user)
  const okPass = equals(decoded.slice(sep + 1), pass)
  return okUser && okPass
}

export function unauthorized(res) {
  // Estas rotas são chamadas por fetch a partir do formulário próprio do
  // Core. WWW-Authenticate faria o navegador abrir um prompt HTTP nativo e
  // deixaria a Promise pendente quando a credencial estivesse errada.
  res.setHeader('Cache-Control', 'no-store')
  return res.status(401).end()
}
