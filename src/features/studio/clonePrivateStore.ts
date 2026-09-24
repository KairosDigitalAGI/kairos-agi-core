export interface PrivateCloneReference {
  id: string
  name: string
  note: string
  createdAt: string
  blob: Blob
}

export interface PrivateClone {
  id: string
  name: string
  note: string
  createdAt: string
  updatedAt: string
  image?: Blob
  references?: PrivateCloneReference[]
}

const DB = 'kairos-private-clones'
const STORE = 'clones'

function open() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB, 1)
    request.onupgradeneeded = () => { if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE, { keyPath: 'id' }) }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(new Error('O cofre privado não pôde ser aberto neste navegador.'))
  })
}
function done(transaction: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve()
    transaction.onerror = transaction.onabort = () => reject(new Error('O cofre privado não pôde salvar esta alteração.'))
  })
}
function normalize(clone: PrivateClone): PrivateClone {
  if (clone.references?.length || !clone.image) return { ...clone, references: clone.references ?? [] }
  return { ...clone, references: [{ id: `${clone.id}-legacy-image`, name: 'Referência inicial', note: 'Importada da versão anterior do cofre.', createdAt: clone.createdAt, blob: clone.image }], image: undefined }
}
export async function listPrivateClones() {
  const db = await open()
  try {
    const tx = db.transaction(STORE, 'readonly')
    const items = await new Promise<PrivateClone[]>((resolve, reject) => {
      const request = tx.objectStore(STORE).getAll() as IDBRequest<PrivateClone[]>
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(new Error('Não foi possível ler o cofre privado.'))
    })
    return items.map(normalize).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  } finally { db.close() }
}
export async function putPrivateClone(clone: PrivateClone) {
  const db = await open()
  try { const tx = db.transaction(STORE, 'readwrite'); tx.objectStore(STORE).put(normalize(clone)); await done(tx) } finally { db.close() }
}
export async function deletePrivateClone(id: string) {
  const db = await open()
  try { const tx = db.transaction(STORE, 'readwrite'); tx.objectStore(STORE).delete(id); await done(tx) } finally { db.close() }
}
