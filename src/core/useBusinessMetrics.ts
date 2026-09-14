import { useCallback, useEffect, useState } from 'react'
import { useOperationsAuth } from './OperationsAuthProvider'
import { fetchOperations, type OperationsFetchState } from './operationsClient'
import type { BusinessMetricsResponse } from '../types/operations'

export function useBusinessMetrics() {
  const { header } = useOperationsAuth()
  const [state, setState] = useState<OperationsFetchState<BusinessMetricsResponse>>({ status: 'sem-credencial' })

  const refresh = useCallback(async () => {
    if (!header) {
      setState({ status: 'sem-credencial' })
      return
    }
    setState({ status: 'carregando' })
    setState(await fetchOperations<BusinessMetricsResponse>('/api/business-metrics', header))
  }, [header])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { state, refresh }
}
