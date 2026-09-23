export type CommercialRunState = 'ready' | 'running' | 'paused_auth' | 'paused_policy' | 'failed' | 'completed'
export type CommercialStep = 'discover' | 'qualify' | 'draft' | 'send' | 'follow_up'
export interface CommercialRun { id:string; channel:string; step:CommercialStep; state:CommercialRunState; reason?:string; updatedAt:string; remoteId?:string }

export function beginRun(run: CommercialRun, now: string): CommercialRun {
  if (run.state !== 'ready') throw new Error('A execução só pode iniciar quando estiver pronta.')
  return { ...run, state:'running', updatedAt:now }
}
export function pauseForAuth(run: CommercialRun, reason: string, now: string): CommercialRun {
  if (run.state !== 'running') throw new Error('Só uma execução em curso pode pausar.')
  return { ...run, state:'paused_auth', reason, updatedAt:now }
}
export function recordRemoteSend(run: CommercialRun, remoteId: string, now: string): CommercialRun {
  if (run.state !== 'running' || run.step !== 'send' || !remoteId.trim()) throw new Error('Envio remoto exige execução ativa, etapa de envio e identificador da plataforma.')
  return { ...run, state:'completed', remoteId:remoteId.trim(), updatedAt:now }
}
