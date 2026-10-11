import type { PrivateCloneReference } from './clonePrivateStore'

export const PRIVATE_REFERENCE_MAX_BYTES = 8 * 1024 * 1024
export const PRIVATE_CLONE_MAX_REFERENCES = 50

type ImportableImage = Pick<File, 'name' | 'size' | 'type' | 'lastModified'>

export interface PrivateImageImportPlan<T extends ImportableImage = File> {
  accepted: T[]
  rejectedInvalid: number
  rejectedDuplicate: number
  rejectedCapacity: number
}

function referenceName(filename: string) {
  return filename.replace(/\.[^.]+$/, '').trim()
}

function fingerprint(name: string, size: number, type: string) {
  return `${referenceName(name).toLocaleLowerCase('pt-BR')}|${size}|${type.toLocaleLowerCase('pt-BR')}`
}

export function planPrivateImageImport<T extends ImportableImage>(
  files: Iterable<T>,
  references: PrivateCloneReference[],
  limit = PRIVATE_CLONE_MAX_REFERENCES,
): PrivateImageImportPlan<T> {
  const accepted: T[] = []
  let rejectedInvalid = 0
  let rejectedDuplicate = 0
  let rejectedCapacity = 0
  const known = new Set(references.map(item => fingerprint(item.name, item.blob.size, item.blob.type)))

  for (const file of files) {
    if (!file.type.startsWith('image/') || file.size <= 0 || file.size > PRIVATE_REFERENCE_MAX_BYTES) {
      rejectedInvalid += 1
      continue
    }
    const key = fingerprint(file.name, file.size, file.type)
    if (known.has(key)) {
      rejectedDuplicate += 1
      continue
    }
    if (references.length + accepted.length >= limit) {
      rejectedCapacity += 1
      continue
    }
    known.add(key)
    accepted.push(file)
  }

  return { accepted, rejectedInvalid, rejectedDuplicate, rejectedCapacity }
}

export function privateReferenceName(filename: string) {
  return referenceName(filename) || 'Referência sem nome'
}
