import { useCallback, useEffect, useState } from 'react'
import { useOperationsAuth } from './OperationsAuthProvider'
import { fetchOperations, type OperationsFetchState } from './operationsClient'
import type { CrmResponse } from '../types/operations'

export function useCrm() {
  const { header } = useOperationsAuth()
  const [state, setState] = useState<OperationsFetchState<CrmResponse>>({ status: 'sem-credencial' })
  const refresh = useCallback(async () => {
    if (!header) return setState({ status: 'sem-credencial' })
    setState({ status: 'carregando' })
    setState(await fetchOperations<CrmResponse>('/api/hunter?action=crm', header))
  }, [header])
  useEffect(() => { void refresh() }, [refresh])
  return { state, refresh }
}
