import { createContext, useContext, useEffect, useReducer, useState, type ReactNode } from 'react'
import { emptyEditorial, migrateLegacyEditorial } from './editorialMigration'
import { editorialReducer, parseEditorial, type EditorialAction } from '../engines/instagram/domain'
import type { EditorialState } from '../types/instagram'
const KEY = 'kairos.editorial.real.v1'
const LEGACY_KEY = 'kairos.editorial.v1'
interface EditorialContext { state: EditorialState; dispatch: React.Dispatch<EditorialAction>; storageError: string }
const Context = createContext<EditorialContext | null>(null)
function load() {
  try {
    const raw = localStorage.getItem(KEY)
    const legacy = raw === null ? localStorage.getItem(LEGACY_KEY) : null
    return { state: raw ? parseEditorial(raw) : legacy ? migrateLegacyEditorial(parseEditorial(legacy)) : emptyEditorial, error: '', blocked: false }
  } catch {
    return { state: emptyEditorial, error: 'Não foi possível ler os dados locais. Nenhum exemplo será exibido e o conteúdo salvo será preservado.', blocked: true }
  }
}
export function EditorialProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(load)
  const [state, dispatch] = useReducer(editorialReducer, initial.state)
  const [storageError, setStorageError] = useState(initial.error)
  useEffect(() => {
    if (initial.blocked) return
    try { localStorage.setItem(KEY, JSON.stringify(state)); setStorageError('') }
    catch { setStorageError('Armazenamento indisponível. Alterações serão mantidas somente enquanto esta página estiver aberta.') }
  }, [state, initial.blocked])
  return <Context.Provider value={{ state, dispatch, storageError }}>{children}</Context.Provider>
}
export function useEditorial() {
  const value = useContext(Context)
  if (!value) throw new Error('EditorialProvider ausente')
  return value
}
