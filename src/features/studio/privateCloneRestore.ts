import type { PrivateClone } from './clonePrivateStore'
import { PRIVATE_CLONE_MAX_REFERENCES } from './privateCloneImport.ts'

export interface PrivateCloneRestorePlan {
  writes: PrivateClone[]
  newClones: number
  mergedClones: number
  addedReferences: number
  skippedReferences: number
}

/** Restore is additive: existing metadata and references always win on identity collisions. */
export function planPrivateCloneRestore(existing: PrivateClone[], incoming: PrivateClone[], now = new Date().toISOString()): PrivateCloneRestorePlan {
  const current = new Map(existing.map(clone => [clone.id, clone]))
  const seenClones = new Set<string>()
  const writes: PrivateClone[] = []
  let newClones = 0
  let mergedClones = 0
  let addedReferences = 0
  let skippedReferences = 0

  for (const clone of incoming) {
    if (seenClones.has(clone.id)) throw new Error('O backup contém identificadores de clone repetidos.')
    seenClones.add(clone.id)
    const references = clone.references ?? []
    if (new Set(references.map(item => item.id)).size !== references.length) throw new Error('O backup contém identificadores de referência repetidos.')
    const saved = current.get(clone.id)
    if (!saved) {
      writes.push(clone)
      newClones += 1
      addedReferences += references.length
      continue
    }

    const savedReferences = saved.references ?? []
    const known = new Set(savedReferences.map(item => item.id))
    const additions = []
    for (const reference of references) {
      if (known.has(reference.id) || savedReferences.length + additions.length >= PRIVATE_CLONE_MAX_REFERENCES) {
        skippedReferences += 1
        continue
      }
      known.add(reference.id)
      additions.push(reference)
    }
    if (!additions.length) continue
    writes.push({ ...saved, references: [...savedReferences, ...additions], updatedAt: now })
    mergedClones += 1
    addedReferences += additions.length
  }

  return { writes, newClones, mergedClones, addedReferences, skippedReferences }
}
