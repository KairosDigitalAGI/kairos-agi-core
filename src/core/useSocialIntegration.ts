import { useCallback, useEffect, useState } from 'react'
import { useOperationsAuth } from './OperationsAuthProvider'
import { fetchOperations, type OperationsFetchState } from './operationsClient'
import type { SocialConnectionStatus, SocialOAuthProvider } from '../types/integration'

export function useSocialIntegration(provider: SocialOAuthProvider) {
  const { header } = useOperationsAuth()
  const [state, setState] = useState<OperationsFetchState<SocialConnectionStatus>>({ status: 'sem-credencial' })
  const [connecting, setConnecting] = useState(false)
  const [connectError, setConnectError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!header) return setState({ status: 'sem-credencial' })
    setState({ status: 'carregando' })
    setState(await fetchOperations<SocialConnectionStatus>(`/api/integrations/${provider}/status`, header))
  }, [header, provider])

  useEffect(() => { void refresh() }, [refresh])

  const connect = useCallback(async () => {
    if (!header) return
    setConnecting(true); setConnectError(null)
    try {
      const response = await fetch(`/api/integrations/${provider}/connect-url`, { headers: { accept: 'application/json', authorization: header }, cache: 'no-store' })
      const body = await response.json().catch(() => ({}))
      if (!response.ok || !body.url) return setConnectError(body.erro || `Não foi possível iniciar ${provider}.`)
      window.location.assign(body.url)
    } catch {
      setConnectError('Não foi possível iniciar a conexão neste ambiente.')
    } finally { setConnecting(false) }
  }, [header, provider])

  const disconnect = useCallback(async () => {
    if (!header) return false
    try {
      const response = await fetch(`/api/integrations/${provider}/disconnect`, { method: 'POST', headers: { authorization: header }, cache: 'no-store' })
      if (!response.ok) return false
      await refresh()
      return true
    } catch { return false }
  }, [header, provider, refresh])

  return { state, refresh, connect, connecting, connectError, disconnect }
}
