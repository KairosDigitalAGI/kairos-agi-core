import { useCallback, useEffect, useState } from 'react'
import { useOperationsAuth } from './OperationsAuthProvider'
import { fetchOperations, type OperationsFetchState } from './operationsClient'
import type { AvatarStudioResponse } from '../types/operations'

// Avatar Studio (Fase 9) — mesmo Basic Auth do Painel Operacional, porque
// grava progresso real em command.avatars (custo zero, mas escrita real).
export function useAvatars() {
  const { header } = useOperationsAuth()
  const [state, setState] = useState<OperationsFetchState<AvatarStudioResponse>>({ status: 'sem-credencial' })
  const [ensuringSlug, setEnsuringSlug] = useState<string | null>(null)
  const [ensureError, setEnsureError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!header) {
      setState({ status: 'sem-credencial' })
      return
    }
    setState({ status: 'carregando' })
    setState(await fetchOperations<AvatarStudioResponse>('/api/avatars/list', header))
  }, [header])

  useEffect(() => {
    void refresh()
  }, [refresh])

  // Cria a linha de progresso inicial (nivel 1/xp 0/coins 0) de UM agente já
  // existente no registro — nunca uma identidade nova.
  const ensureAvatar = useCallback(
    async (agenteSlug: string) => {
      if (!header) return false
      setEnsuringSlug(agenteSlug)
      setEnsureError(null)
      try {
        const response = await fetch('/api/avatars/upsert', {
          method: 'POST',
          headers: { 'content-type': 'application/json', authorization: header },
          body: JSON.stringify({ agenteSlug }),
        })
        if (!response.ok) {
          const body = await response.json().catch(() => ({}))
          setEnsureError(body.erro || `/api/avatars/upsert respondeu ${response.status}.`)
          return false
        }
        await refresh()
        return true
      } catch {
        setEnsureError('Não foi possível registrar o progresso neste ambiente. Nenhum avatar foi presumido criado.')
        return false
      } finally {
        setEnsuringSlug(null)
      }
    },
    [header, refresh],
  )

  return { state, refresh, ensureAvatar, ensuringSlug, ensureError }
}
