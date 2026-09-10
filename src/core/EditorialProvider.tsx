import { createContext, useContext, useEffect, useReducer, useState, type ReactNode } from 'react'
import { editorialSeed } from '../data/mock/editorial'
import { editorialReducer, parseEditorial, type EditorialAction } from '../engines/instagram/domain'
import type { EditorialState } from '../types/instagram'
const KEY = 'kairos.editorial.v1'
interface EditorialContext { state: EditorialState; dispatch: React.Dispatch<EditorialAction>; storageError: string }
const Context = createContext<EditorialContext | null>(null)
function load() {
  try {
    const raw = localStorage.getItem(KEY)
    return { state: raw ? parseEditorial(raw) : editorialSeed, error: '', blocked: false }
  } catch {
    return { state: editorialSeed, error: 'Não foi possível ler os dados locais. Usando exemplos nesta sessão, sem sobrescrever o conteúdo salvo.', blocked: true }
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
