import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

export const defaultOutboxPath = () => process.env.PROJECT_LOG_OUTBOX_PATH || join(process.cwd(), '.kairos-local', 'project-log-outbox.jsonl')
const publicEntry = entry => ({
  agent: entry.agent, phase: entry.phase ?? null, type: entry.type, title: entry.title,
  description: entry.description ?? null, commit: entry.commit ?? null, deployed: Boolean(entry.deployed),
})
const fingerprint = entry => createHash('sha256').update(JSON.stringify([entry.agent, entry.phase, entry.type, entry.title, entry.commit])).digest('hex')

export function readOutbox(file = defaultOutboxPath()) {
  if (!existsSync(file)) return []
  try {
    const rows = readFileSync(file, 'utf8').split('\n').filter(Boolean).map(line => JSON.parse(line))
    if (rows.some(row => !row || typeof row.key !== 'string' || !row.entry || row.key !== fingerprint(row.entry))) throw new Error('registro inválido')
    return rows
  } catch {
    throw new Error('Outbox local do Mapa ilegível; arquivo preservado para recuperação manual.')
  }
}

function writeOutbox(rows, file) {
  mkdirSync(dirname(file), { recursive: true })
  const temporary = `${file}.${process.pid}.tmp`
  writeFileSync(temporary, rows.length ? `${rows.map(row => JSON.stringify(row)).join('\n')}\n` : '', { mode: 0o600 })
  renameSync(temporary, file)
}

export function queueProjectLog(entry, file = defaultOutboxPath()) {
  const rows = readOutbox(file)
  const safe = publicEntry(entry)
  if (!['codex', 'claude-code', 'founder'].includes(safe.agent) || !['done', 'todo', 'bug', 'idea'].includes(safe.type) || typeof safe.title !== 'string' || !safe.title.trim()) throw new Error('Entrada do Mapa inválida; não adicionada à fila local.')
  const key = fingerprint(safe)
  if (rows.some(row => row.key === key)) return { queued: false, pending: rows.length }
  rows.push({ key, entry: safe, queued_at: new Date().toISOString() })
  writeOutbox(rows, file)
  return { queued: true, pending: rows.length }
}

export async function flushProjectLog({ base, auth, fetchImpl = fetch, file = defaultOutboxPath() }) {
  let rows = readOutbox(file)
  if (!rows.length) return { sent: 0, alreadyPresent: 0, pending: 0 }
  const listed = await fetchImpl(`${base}/api/project-log`, { headers: { authorization: auth } })
  if (!listed.ok) throw new Error(`Mapa indisponível (${listed.status}); outbox preservado.`)
  const body = await listed.json()
  const known = new Set((Array.isArray(body.entries) ? body.entries : []).map(fingerprint))
  let sent = 0
  let alreadyPresent = 0
  while (rows.length) {
    const row = rows[0]
    if (known.has(row.key)) alreadyPresent += 1
    else {
      const response = await fetchImpl(`${base}/api/project-log`, {
        method: 'POST', headers: { 'content-type': 'application/json', authorization: auth }, body: JSON.stringify(row.entry),
      })
      if (!response.ok) throw new Error(`Mapa recusou registro (${response.status}); outbox preservado.`)
      sent += 1
      known.add(row.key)
    }
    rows = rows.slice(1)
    writeOutbox(rows, file)
  }
  return { sent, alreadyPresent, pending: rows.length }
}
