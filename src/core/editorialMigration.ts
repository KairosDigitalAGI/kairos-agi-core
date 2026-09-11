import type { EditorialState } from '../types/instagram'
export const emptyEditorial: EditorialState = { version: 1, items: [], prompts: [] }
// Legacy source is retained intact under its old storage key, including edited demos.
export function migrateLegacyEditorial(state: EditorialState): EditorialState {
  return { ...state, items: state.items.filter(item => !['IG-001', 'IG-002', 'IG-003'].includes(item.id)), prompts: state.prompts.filter(prompt => !['PR-001', 'PR-002'].includes(prompt.id)) }
}
