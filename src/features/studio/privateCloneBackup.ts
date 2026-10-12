import type { PrivateClone, PrivateCloneReference } from './clonePrivateStore'

const FORMAT = 'kairos-private-clones'
const VERSION = 1
const ITERATIONS = 250_000
const ADDITIONAL_DATA = new TextEncoder().encode(`${FORMAT}:v${VERSION}`)
export const PRIVATE_BACKUP_MAX_BYTES = 120 * 1024 * 1024

interface SerializedReference {
  id: string
  name: string
  note: string
  createdAt: string
  type: string
  data: string
}

interface SerializedClone extends Omit<PrivateClone, 'image' | 'references'> {
  references: SerializedReference[]
}

interface PrivateCloneBackupEnvelope {
  format: typeof FORMAT
  version: typeof VERSION
  createdAt: string
  kdf: { name: 'PBKDF2'; hash: 'SHA-256'; iterations: number; salt: string }
  cipher: { name: 'AES-GCM'; iv: string }
  ciphertext: string
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = ''
  for (let offset = 0; offset < bytes.length; offset += 32_768) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 32_768))
  }
  return btoa(binary)
}

function base64ToBytes(value: string) {
  const binary = atob(value)
  return Uint8Array.from(binary, character => character.charCodeAt(0))
}

function toArrayBuffer(bytes: Uint8Array) {
  return Uint8Array.from(bytes).buffer
}

async function deriveKey(password: string, salt: Uint8Array, usage: KeyUsage[]) {
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt: toArrayBuffer(salt), iterations: ITERATIONS },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    usage,
  )
}

function validText(value: unknown, maximum: number) {
  return typeof value === 'string' && value.length <= maximum
}

function assertPayload(value: unknown): asserts value is { clones: SerializedClone[] } {
  if (!value || typeof value !== 'object' || !Array.isArray((value as { clones?: unknown }).clones)) throw new Error('O backup não contém uma coleção válida.')
  const clones = (value as { clones: unknown[] }).clones
  if (clones.length > 20) throw new Error('O backup excede o limite de 20 clones.')
  for (const clone of clones) {
    if (!clone || typeof clone !== 'object') throw new Error('O backup contém um clone inválido.')
    const item = clone as Partial<SerializedClone>
    if (!validText(item.id, 100) || !item.id || !validText(item.name, 80) || !validText(item.note, 1000) || !validText(item.createdAt, 40) || !validText(item.updatedAt, 40) || !Array.isArray(item.references) || item.references.length > 50) throw new Error('O backup contém metadados fora dos limites.')
    for (const reference of item.references) {
      if (!reference || !validText(reference.id, 100) || !reference.id || !validText(reference.name, 100) || !validText(reference.note, 1000) || !validText(reference.createdAt, 40) || typeof reference.type !== 'string' || !reference.type.startsWith('image/') || typeof reference.data !== 'string' || reference.data.length > 11_200_000) throw new Error('O backup contém uma referência inválida.')
    }
  }
}

async function serializeReference(reference: PrivateCloneReference): Promise<SerializedReference> {
  return {
    id: reference.id,
    name: reference.name,
    note: reference.note,
    createdAt: reference.createdAt,
    type: reference.blob.type,
    data: bytesToBase64(new Uint8Array(await reference.blob.arrayBuffer())),
  }
}

export async function exportPrivateCloneBackup(clones: PrivateClone[], password: string) {
  if (password.length < 10) throw new Error('Use uma senha de backup com pelo menos 10 caracteres.')
  const serialized: SerializedClone[] = []
  for (const clone of clones) {
    const references = []
    for (const reference of clone.references ?? []) references.push(await serializeReference(reference))
    serialized.push({ id: clone.id, name: clone.name, note: clone.note, createdAt: clone.createdAt, updatedAt: clone.updatedAt, references })
  }
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(password, salt, ['encrypt'])
  const plaintext = new TextEncoder().encode(JSON.stringify({ clones: serialized }))
  if (plaintext.byteLength > PRIVATE_BACKUP_MAX_BYTES) throw new Error('O cofre excede o limite de 120 MB para um backup local.')
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: toArrayBuffer(iv), additionalData: toArrayBuffer(ADDITIONAL_DATA) }, key, toArrayBuffer(plaintext))
  const envelope: PrivateCloneBackupEnvelope = {
    format: FORMAT,
    version: VERSION,
    createdAt: new Date().toISOString(),
    kdf: { name: 'PBKDF2', hash: 'SHA-256', iterations: ITERATIONS, salt: bytesToBase64(salt) },
    cipher: { name: 'AES-GCM', iv: bytesToBase64(iv) },
    ciphertext: bytesToBase64(new Uint8Array(ciphertext)),
  }
  return new Blob([JSON.stringify(envelope)], { type: 'application/vnd.kairos.private-vault+json' })
}

export async function importPrivateCloneBackup(file: Blob, password: string): Promise<PrivateClone[]> {
  if (password.length < 10) throw new Error('Informe a senha usada para criar o backup.')
  if (file.size <= 0 || file.size > PRIVATE_BACKUP_MAX_BYTES * 1.4) throw new Error('O arquivo de backup está vazio ou excede o limite permitido.')
  let envelope: PrivateCloneBackupEnvelope
  try { envelope = JSON.parse(await file.text()) as PrivateCloneBackupEnvelope } catch { throw new Error('O arquivo não é um backup Kairos válido.') }
  if (envelope.format !== FORMAT || envelope.version !== VERSION || envelope.kdf?.iterations !== ITERATIONS || envelope.kdf?.name !== 'PBKDF2' || envelope.kdf?.hash !== 'SHA-256' || envelope.cipher?.name !== 'AES-GCM') throw new Error('Formato ou versão de backup incompatível.')
  try {
    const salt = base64ToBytes(envelope.kdf.salt)
    const iv = base64ToBytes(envelope.cipher.iv)
    if (salt.length !== 16 || iv.length !== 12) throw new Error('invalid parameters')
    const key = await deriveKey(password, salt, ['decrypt'])
    const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: toArrayBuffer(iv), additionalData: toArrayBuffer(ADDITIONAL_DATA) }, key, toArrayBuffer(base64ToBytes(envelope.ciphertext)))
    const payload: unknown = JSON.parse(new TextDecoder().decode(plaintext))
    assertPayload(payload)
    return payload.clones.map(clone => ({
      id: clone.id,
      name: clone.name,
      note: clone.note,
      createdAt: clone.createdAt,
      updatedAt: clone.updatedAt,
      references: clone.references.map(reference => {
        const bytes = base64ToBytes(reference.data)
        if (bytes.byteLength > 8 * 1024 * 1024) throw new Error('O backup contém uma imagem acima do limite de 8 MB.')
        return { id: reference.id, name: reference.name, note: reference.note, createdAt: reference.createdAt, blob: new Blob([bytes], { type: reference.type }) }
      }),
    }))
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('O backup')) throw error
    throw new Error('Não foi possível abrir o backup. Confira a senha e a integridade do arquivo.')
  }
}
