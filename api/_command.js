// Leitura server-side do schema `command` — o control plane do Supabase
// mestre kairos, a mesma base que o kairos-command escreve e o sidecar
// (kairos-command/sidecar) alimenta a partir das VPS.
//
// Mesmo contrato REST do sidecar: PostgREST com Accept-Profile/Content-Profile
// para o schema isolado (sem isso a consulta bate em `public`, que é outra
// coisa). Zero dependência — só `fetch` nativo, no mesmo espírito do sidecar.
//
// Só GET. Nenhuma função aqui grava, atualiza ou apaga nada em `command`.
// Sem SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY configurados, devolve `null` —
// quem chama decide como comunicar "ainda não conectado" sem inventar zero.
export function commandConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

export async function readCommand(table, query = '') {
  if (!commandConfigured()) return null
  const base = process.env.SUPABASE_URL.replace(/\/+$/, '')
  const url = `${base}/rest/v1/${table}${query}`
  const res = await fetch(url, {
    headers: {
      apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
      'Accept-Profile': 'command',
    },
  })
  if (!res.ok) {
    const corpo = await res.text().catch(() => '')
    throw new Error(`command.${table} respondeu ${res.status}: ${corpo.slice(0, 200)}`)
  }
  return res.json()
}
