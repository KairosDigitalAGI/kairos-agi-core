// Fetch compartilhado das rotas reais do Painel Operacional
// (business-metrics, agent-status) — as duas exigem o mesmo header Basic e
// tratam 401/erro de rede da mesma forma: nunca inventar dado, só reportar
// "indisponível" com o motivo.
export type OperationsFetchState<T> =
  | { status: 'sem-credencial' }
  | { status: 'carregando' }
  | { status: 'erro'; mensagem: string }
  | { status: 'ok'; data: T }

export async function fetchOperations<T>(path: string, header: string): Promise<OperationsFetchState<T>> {
  try {
    const response = await fetch(path, {
      headers: { accept: 'application/json', authorization: header },
      cache: 'no-store',
    })
    if (response.status === 401) {
      return { status: 'erro', mensagem: 'Credencial do Painel Operacional recusada. Confira usuário e senha.' }
    }
    if (!response.ok) {
      return { status: 'erro', mensagem: `${path} respondeu ${response.status}.` }
    }
    return { status: 'ok', data: (await response.json()) as T }
  } catch {
    return { status: 'erro', mensagem: 'Painel Operacional indisponível neste ambiente. Nenhum dado foi presumido.' }
  }
}
