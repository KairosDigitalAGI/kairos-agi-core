import test from 'node:test'
import assert from 'node:assert/strict'
import { deriveProjectMapState } from '../src/features/projectmap/projectMapState.ts'

test('a done entry resolves an older todo with the same normalized title', () => {
  const state = deriveProjectMapState([
    { id: 'done-1', type: 'done', title: ' Validar conversa REAL completa ' },
    { id: 'todo-1', type: 'todo', title: 'validar conversa real completa' },
  ])
  assert.deepEqual([...state.openTodoIds], [])
  assert.deepEqual([...state.resolvedTodoIds], ['todo-1'])
})

test('a newer todo reopens work even when an older done has the same title', () => {
  const state = deriveProjectMapState([
    { id: 'todo-2', type: 'todo', title: 'Auditar CRM' },
    { id: 'done-1', type: 'done', title: 'Auditar CRM' },
    { id: 'todo-1', type: 'todo', title: 'Auditar CRM' },
  ])
  assert.deepEqual([...state.openTodoIds], ['todo-2'])
  assert.deepEqual([...state.resolvedTodoIds], ['todo-1'])
})
