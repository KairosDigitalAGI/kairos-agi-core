import { useCallback, useEffect, useState } from 'react'
import { useOperationsAuth } from './OperationsAuthProvider'
import { fetchOperations, type OperationsFetchState } from './operationsClient'
export interface CommercialRunRecord { id:string; channel:string; step:string; state:string; updated_at:string; remote_id:string|null; reason:string|null }
export function useCommercialRuns(){const {header}=useOperationsAuth();const [state,setState]=useState<OperationsFetchState<{source:'real';runs:CommercialRunRecord[]}>>({status:'sem-credencial'});const refresh=useCallback(async()=>{if(!header)return setState({status:'sem-credencial'});setState({status:'carregando'});setState(await fetchOperations('/api/commercial-runs',header))},[header]);useEffect(()=>{void refresh()},[refresh]);return{state,refresh}}
