import type { StoredVideo } from '../../types/video'

const DATABASE = 'kairos-video-library'
const STORE = 'videos'

function openLibrary() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DATABASE, 1)
    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains(STORE)) database.createObjectStore(STORE, { keyPath: 'id' })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(new Error('A galeria local não pôde ser aberta.'))
  })
}

function requestResult<T>(request: IDBRequest<T>, message: string) {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(new Error(message))
  })
}

function transactionDone(transaction: IDBTransaction, message: string) {
  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(new Error(message))
    transaction.onabort = () => reject(new Error(message))
  })
}

export async function saveVideo(video: StoredVideo) {
  const database = await openLibrary()
  try {
    const transaction = database.transaction(STORE, 'readwrite')
    transaction.objectStore(STORE).put(video)
    await transactionDone(transaction, 'O navegador não conseguiu salvar o vídeo na galeria.')
  } finally { database.close() }
}

export async function listVideos(): Promise<StoredVideo[]> {
  const database = await openLibrary()
  try {
    const transaction = database.transaction(STORE, 'readonly')
    const videos = await requestResult(transaction.objectStore(STORE).getAll() as IDBRequest<StoredVideo[]>, 'A galeria local não pôde ser lida.')
    return videos.sort((left, right) => right.createdAt.localeCompare(left.createdAt))
  } finally { database.close() }
}

export async function deleteVideo(id: string) {
  const database = await openLibrary()
  try {
    const transaction = database.transaction(STORE, 'readwrite')
    transaction.objectStore(STORE).delete(id)
    await transactionDone(transaction, 'O vídeo não pôde ser removido da galeria.')
  } finally { database.close() }
}
