import type { ProjectLogEntry } from '../../types/operations'

const normalizeTitle = (value: string) => String(value || '').trim().toLocaleLowerCase('pt-BR').replace(/\s+/g, ' ')

// O Mapa continua append-only. Uma entrega `done` mais recente, com o mesmo
// título de uma pendência, encerra o item sem editar ou apagar o registro
// original. Uma nova pendência posterior ao `done` reabre o assunto.
export function deriveProjectMapState(entries: ProjectLogEntry[]) {
  const completedTitles = new Set<string>()
  const resolvedTodoIds = new Set<string>()
  const openTodoIds = new Set<string>()

  for (const entry of entries) {
    const title = normalizeTitle(entry.title)
    if (!title) continue
    if (entry.type === 'done') completedTitles.add(title)
    if (entry.type === 'todo') {
      if (completedTitles.has(title)) resolvedTodoIds.add(entry.id)
      else openTodoIds.add(entry.id)
    }
  }

  return { openTodoIds, resolvedTodoIds }
}
