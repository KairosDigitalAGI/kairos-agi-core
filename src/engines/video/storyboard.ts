import type { VideoGenerationPlan, VideoScene } from '../../types/video'

const palettes = [
  ['#7c3aed', '#38bdf8'],
  ['#2563eb', '#22d3ee'],
  ['#9333ea', '#f43f5e'],
  ['#0f766e', '#a3e635'],
  ['#c2410c', '#facc15'],
] as const

function hash(value: string) {
  let result = 2166136261
  for (const character of value) result = Math.imul(result ^ character.charCodeAt(0), 16777619)
  return result >>> 0
}

export function validateGenerationPlan(plan: VideoGenerationPlan) {
  if (plan.title.trim().length < 3) return 'Dê um título com pelo menos 3 caracteres.'
  if (plan.script.trim().length < 10) return 'Escreva um roteiro com pelo menos 10 caracteres.'
  if (plan.script.length > 3000) return 'O roteiro pode ter no máximo 3.000 caracteres.'
  if (!Number.isFinite(plan.secondsPerScene) || plan.secondsPerScene < 2 || plan.secondsPerScene > 8) return 'Cada cena deve durar entre 2 e 8 segundos.'
  return ''
}

export function compileStoryboard(plan: VideoGenerationPlan): VideoScene[] {
  const issue = validateGenerationPlan(plan)
  if (issue) return []
  const sentences = plan.script
    .split(/\n+|(?<=[.!?])\s+/)
    .map(sentence => sentence.trim().replace(/\s+/g, ' '))
    .filter(Boolean)
    .slice(0, 12)
  return sentences.map((headline, index) => {
    const palette = palettes[hash(`${plan.title}:${headline}:${index}`) % palettes.length]
    return {
      id: `${index + 1}-${hash(headline).toString(36)}`,
      headline,
      kicker: index === 0 ? plan.title.trim() : `CENA ${String(index + 1).padStart(2, '0')}`,
      durationSeconds: plan.secondsPerScene,
      accent: palette[0],
      secondary: palette[1],
      motion: (['orbit', 'rise', 'pulse'] as const)[hash(headline) % 3],
    }
  })
}

export function generationDuration(scenes: VideoScene[]) {
  return scenes.reduce((total, scene) => total + scene.durationSeconds, 0)
}
