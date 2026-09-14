import { useCallback, useEffect, useState } from 'react'
import { useOperationsAuth } from './OperationsAuthProvider'
import { fetchOperations, type OperationsFetchState } from './operationsClient'
import type { YoutubeConnectionStatus } from '../types/integration'

export function useYoutubeIntegration() {
  const { header } = useOperationsAuth()
  const [state, setState] = useState<OperationsFetchState<YoutubeConnectionStatus>>({ status: 'sem-credencial' })
  const [connecting, setConnecting] = useState(false)
  const [connectError, setConnectError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!header) {
      setState({ status: 'sem-credencial' })
      return
    }
    setState({ status: 'carregando' })
    setState(await fetchOperations<YoutubeConnectionStatus>('/api/integrations/youtube/status', header))
  }, [header])

  useEffect(() => {
    void refresh()
  }, [refresh])

  // Pede a URL de consentimento ao backend e navega o próprio navegador até
  // ela — o fetch só busca a URL (autenticado); quem completa o OAuth é o
  // navegador indo até o Google de verdade, não uma chamada em segundo plano.
  const connect = useCallback(async () => {
    if (!header) return
    setConnecting(true)
    setConnectError(null)
    try {
      const response = await fetch('/api/integrations/youtube/connect-url', {
        headers: { accept: 'application/json', authorization: header },
        cache: 'no-store',
      })
      const body = await response.json().catch(() => ({}))
      if (!response.ok || !body.url) {
        setConnectError(body.erro || `/api/integrations/youtube/connect-url respondeu ${response.status}.`)
        return
      }
      window.location.assign(body.url)
    } catch {
      setConnectError('Não foi possível iniciar a conexão neste ambiente.')
    } finally {
      setConnecting(false)
    }
  }, [header])

  const disconnect = useCallback(async () => {
    if (!header) return false
    try {
      const response = await fetch('/api/integrations/youtube/disconnect', {
        method: 'POST',
        headers: { authorization: header },
        cache: 'no-store',
      })
      if (!response.ok) return false
      await refresh()
      return true
    } catch {
      return false
    }
  }, [header, refresh])

  return { state, refresh, connect, connecting, connectError, disconnect }
}
