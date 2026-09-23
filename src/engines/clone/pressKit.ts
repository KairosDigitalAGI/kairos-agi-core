export const pressKitViews = [
  'Rosto frontal', 'Rosto 3/4', 'Perfil esquerdo', 'Perfil direito',
  'Corpo inteiro frontal', 'Corpo inteiro lateral', 'Corpo inteiro traseiro',
  'Expressões', 'Figurino e adereços', 'Paleta e cenário',
] as const

export function missingPressKitViews(reference: string) {
  const normalized = reference.toLocaleLowerCase('pt-BR')
  return pressKitViews.filter(view => !normalized.includes(view.toLocaleLowerCase('pt-BR')))
}

export function pressKitReadiness(reference: string) {
  const missing = missingPressKitViews(reference)
  return missing.length === 0
    ? 'Press kit completo para continuidade visual.'
    : `Faltam referências: ${missing.join(', ')}.`
}
