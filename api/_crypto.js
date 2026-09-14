// Cifra server-side dos tokens de integração (Missão 006, Fase 4) e assinatura
// do `state` do fluxo OAuth. Zero dependência — só `node:crypto`, mesmo
// espírito do resto deste Core.
//
// Uma única chave, KAIROS_TOKEN_ENCRYPTION_KEY, alimenta as duas coisas, mas
// nunca a mesma derivação: `chaveCifra()` e `chaveAssinatura()` passam por
// domain separation (sha256 do segredo + um rótulo fixo diferente cada uma)
// para que uma eventual quebra de uso não vire quebra da outra.
import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

function segredo() {
  const raw = process.env.KAIROS_TOKEN_ENCRYPTION_KEY
  if (!raw || !raw.trim()) throw new Error('KAIROS_TOKEN_ENCRYPTION_KEY não configurada nesta implantação.')
  return raw
}

// sha256 do valor bruto do env var: aceita qualquer formato (texto, hex,
// base64, o que o Founder colar) e sempre devolve os 32 bytes que o AES-256
// exige, sem exigir que ele acerte um encoding específico.
function chaveCifra() {
  return createHash('sha256').update(`kairos:token-cipher:${segredo()}`, 'utf8').digest()
}

function chaveAssinatura() {
  return createHash('sha256').update(`kairos:oauth-state:${segredo()}`, 'utf8').digest()
}

const IV_BYTES = 12
const TAG_BYTES = 16

/** Cifra um texto (ex.: access_token) para o que vai gravado em `command.integracoes_tokens`. */
export function encrypt(plaintext) {
  const iv = randomBytes(IV_BYTES)
  const cipher = createCipheriv('aes-256-gcm', chaveCifra(), iv)
  const ciphertext = Buffer.concat([cipher.update(String(plaintext), 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, ciphertext]).toString('base64')
}

/** Decifra o que `encrypt()` produziu. Lança se a chave mudou ou o ciphertext foi adulterado. */
export function decrypt(base64) {
  const buf = Buffer.from(String(base64), 'base64')
  const iv = buf.subarray(0, IV_BYTES)
  const tag = buf.subarray(IV_BYTES, IV_BYTES + TAG_BYTES)
  const ciphertext = buf.subarray(IV_BYTES + TAG_BYTES)
  const decipher = createDecipheriv('aes-256-gcm', chaveCifra(), iv)
  decipher.setAuthTag(tag)
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8')
}

const STATE_WINDOW_MS = 10 * 60 * 1000 // 10 minutos — tempo de sobra para o Founder concluir o consentimento no Google

/**
 * Assina o `state` do OAuth. Substitui uma tabela de nonce por um HMAC com
 * validade curta: o Google devolve exatamente o que mandamos, então validar
 * a assinatura + a janela de tempo é suficiente para provar que o callback
 * corresponde a um `connect-url` que este backend gerou há pouco — sem
 * guardar sessão nenhuma no meio.
 */
export function signState(payload) {
  const body = Buffer.from(JSON.stringify({ ...payload, iat: Date.now() }), 'utf8').toString('base64url')
  const mac = createHmac('sha256', chaveAssinatura()).update(body).digest('base64url')
  return `${body}.${mac}`
}

/** Verifica o `state`. Devolve o payload original, ou `null` se inválido/expirado/adulterado. */
export function verifyState(state) {
  if (typeof state !== 'string' || !state.includes('.')) return null
  const [body, mac] = state.split('.')
  if (!body || !mac) return null

  const esperado = createHmac('sha256', chaveAssinatura()).update(body).digest('base64url')
  const a = Buffer.from(mac)
  const b = Buffer.from(esperado)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null

  let payload
  try {
    payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))
  } catch {
    return null
  }
  if (typeof payload.iat !== 'number' || Date.now() - payload.iat > STATE_WINDOW_MS) return null
  return payload
}
