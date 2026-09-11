import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { cloneReducer, emptyClone, parseClone, type CloneAction } from '../engines/clone/domain'
import type { CloneState } from '../types/clone'
const KEY = 'kairos.clone.v1'
function load() {
  try { const raw = localStorage.getItem(KEY); return { state: raw ? parseClone(raw) : emptyClone, raw, error: '' } }
  catch { return { state: emptyClone, raw: null, error: 'Não foi possível ler o catálogo salvo. O original foi preservado; recarregue após recuperar o armazenamento.' } }
}
const Context = createContext<{ state: CloneState; dispatch: (action: CloneAction) => boolean; error: string } | null>(null)
export function CloneProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(load)
  const [state, setState] = useState(initial.state)
  const current = useRef(initial.state)
  const lastRaw = useRef(initial.raw)
  const [error, setError] = useState(initial.error)
  const blocked = useRef(!!initial.error)
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === KEY || event.key === null) { blocked.current = true; setError('O catálogo mudou em outra aba. Recarregue para continuar sem sobrescrever alterações.') }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])
  const dispatch = (action: CloneAction) => {
    if (blocked.current) return false
    try {
      if (localStorage.getItem(KEY) !== lastRaw.current) { blocked.current = true; setError('Dados alterados em outra aba. Recarregue antes de editar.'); return false }
      const next = cloneReducer(current.current, action)
      const raw = JSON.stringify(next)
      localStorage.setItem(KEY, raw)
      lastRaw.current = raw; current.current = next; setState(next); setError(''); return true
    } catch { setError('Não foi possível salvar. A alteração não foi aplicada. Libere espaço ou habilite o armazenamento e tente novamente.'); return false }
  }
  return <Context.Provider value={{ state, dispatch, error }}>{children}</Context.Provider>
}
export function useClone() { const value = useContext(Context); if (!value) throw new Error('CloneProvider ausente'); return value }
