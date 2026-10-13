import type { PrivateClone } from './clonePrivateStore'
import { PRIVATE_CLONE_MAX_REFERENCES, PRIVATE_REFERENCE_MAX_BYTES } from './privateCloneImport.ts'

export interface PrivateVaultIntegrity {
  cloneCount: number
  referenceCount: number
  totalBytes: number
  emptyCloneCount: number
  duplicateReferenceCount: number
  invalidReferenceCount: number
  fingerprint: string
  checkedAt: string
  status: 'verified' | 'attention'
}

function toHex(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)].map(value => value.toString(16).padStart(2, '0')).join('')
}

async function sha256(value: ArrayBuffer | Uint8Array) {
  const bytes = Uint8Array.from(value instanceof Uint8Array ? value : new Uint8Array(value))
  return toHex(await crypto.subtle.digest('SHA-256', bytes.buffer))
}

function duplicateKey(name: string, blob: Blob) {
  return `${name.trim().toLocaleLowerCase('pt-BR')}|${blob.size}|${blob.type.toLocaleLowerCase('pt-BR')}`
}

export async function inspectPrivateCloneVault(clones: PrivateClone[]): Promise<PrivateVaultIntegrity> {
  let referenceCount = 0
  let totalBytes = 0
  let duplicateReferenceCount = 0
  let invalidReferenceCount = 0
  let emptyCloneCount = 0
  const manifest: unknown[] = []

  for (const clone of [...clones].sort((a, b) => a.id.localeCompare(b.id))) {
    const references = [...(clone.references ?? [])].sort((a, b) => a.id.localeCompare(b.id))
    if (!references.length) emptyCloneCount += 1
    if (references.length > PRIVATE_CLONE_MAX_REFERENCES) invalidReferenceCount += references.length - PRIVATE_CLONE_MAX_REFERENCES
    const known = new Set<string>()
    const referenceManifest = []

    for (const reference of references) {
      referenceCount += 1
      totalBytes += reference.blob.size
      const key = duplicateKey(reference.name, reference.blob)
      if (known.has(key)) duplicateReferenceCount += 1
      known.add(key)
      if (!reference.blob.type.startsWith('image/') || reference.blob.size <= 0 || reference.blob.size > PRIVATE_REFERENCE_MAX_BYTES) invalidReferenceCount += 1
      referenceManifest.push({
        id: reference.id,
        name: reference.name,
        note: reference.note,
        createdAt: reference.createdAt,
        type: reference.blob.type,
        size: reference.blob.size,
        sha256: await sha256(await reference.blob.arrayBuffer()),
      })
    }

    manifest.push({
      id: clone.id,
      name: clone.name,
      note: clone.note,
      createdAt: clone.createdAt,
      updatedAt: clone.updatedAt,
      references: referenceManifest,
    })
  }

  const fingerprint = await sha256(new TextEncoder().encode(JSON.stringify({ version: 1, clones: manifest })))
  const status = duplicateReferenceCount || invalidReferenceCount ? 'attention' : 'verified'
  return { cloneCount: clones.length, referenceCount, totalBytes, emptyCloneCount, duplicateReferenceCount, invalidReferenceCount, fingerprint, checkedAt: new Date().toISOString(), status }
}
