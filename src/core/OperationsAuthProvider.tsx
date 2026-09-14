import { createContext, useContext, useState, type ReactNode } from 'react'

// Guarda a credencial Basic Auth do "Painel Operacional" (business-metrics,
// agent-status) só em sessionStorage — some ao fechar a aba, nunca vai para
// localStorage nem para fora deste navegador. É a MESMA ideia do Basic Auth
// do kairos-os (api/_auth.js), só que a credencial fica em memória do Founder,
// não numa var de ambiente que o servidor decodifica sozinho: aqui é o
// Founder quem digita para desbloquear os dois endpoints reais desta sessão.
const KEY = 'kairos.ops.basic.v1'

interface OperationsAuthValue {
  header: string | null
  setCredentials: (user: string, pass: string) => void
  clear: () => void
}

const Context = createContext<OperationsAuthValue | null>(null)

function load(): string | null {
  try {
    return sessionStorage.getItem(KEY)
  } catch {
    return null
  }
}

export function OperationsAuthProvider({ children }: { children: ReactNode }) {
  const [header, setHeader] = useState<string | null>(load)

  const setCredentials = (user: string, pass: string) => {
    const token = `Basic ${btoa(`${user}:${pass}`)}`
    try {
      sessionStorage.setItem(KEY, token)
    } catch {
      // Sem storage: a credencial ainda funciona nesta renderização, só não sobrevive a reload.
    }
    setHeader(token)
  }

  const clear = () => {
    try {
      sessionStorage.removeItem(KEY)
    } catch {
      // noop
    }
    setHeader(null)
  }

  return <Context.Provider value={{ header, setCredentials, clear }}>{children}</Context.Provider>
}

export function useOperationsAuth() {
  const value = useContext(Context)
  if (!value) throw new Error('OperationsAuthProvider ausente')
  return value
}
