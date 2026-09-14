import { useCallback, useEffect, useState } from 'react'
import { useOperationsAuth } from './OperationsAuthProvider'
import { fetchOperations, type OperationsFetchState } from './operationsClient'
import type { FleetStatusResponse } from '../types/operations'

export function useFleetStatus() {
  const { header } = useOperationsAuth()
  const [state, setState] = useState<OperationsFetchState<FleetStatusResponse>>({ status: 'sem-credencial' })

  const refresh = useCallback(async () => {
    if (!header) {
      setState({ status: 'sem-credencial' })
      return
    }
    setState({ status: 'carregando' })
    setState(await fetchOperations<FleetStatusResponse>('/api/agent-status', header))
  }, [header])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { state, refresh }
}
