/**
 * EP00 — Trailer Institucional Kairos Digital
 * Produção real: 6 cenas × 5s = 30s via Higgsfield Seedance 2.5
 *
 * Uso:
 *   npx tsx scripts/produce-ep00.ts
 *
 * Opcional — fornecer imagens de referência GPT para cenas com personagens:
 *   Crie scripts/ep00-image-refs.json com o formato:
 *   { "2": "https://...", "5": "https://..." }
 *
 * Resultado salvo em scripts/ep00-result.json
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

// ─── Carrega .env.local ───────────────────────────────────────────────────────
try {
  const raw = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8')
  for (const line of raw.split('\n')) {
    const match = /^([^#=\s]+)\s*=\s*(.*)$/.exec(line.trim())
    if (match) process.env[match[1]] = match[2]
  }
} catch { /* variáveis já no ambiente */ }

import { config, higgsfield } from '@higgsfield/client/v2'

const credentials = process.env.HF_CREDENTIALS
if (!credentials) {
  console.error('HF_CREDENTIALS não encontrado. Adicione ao .env.local: HF_CREDENTIALS=id:secret')
  process.exit(1)
}
config({ credentials })

// ─── Prompts EP00 ─────────────────────────────────────────────────────────────
const SCENES: Record<number, { title: string; prompt: string; needsRef?: string }> = {
  1: {
    title: 'Abertura — Mundo em Caos Digital',
    prompt: 'Cinematic aerial view of a major Brazilian city at night, São Paulo skyline. Dark stormy atmosphere. Dozens of glowing smartphone screens float and fall through the dark air — each shows a WhatsApp chat with unanswered messages, missed call notifications, "LEAD PERDIDO" alerts, red warning icons. Some screens shatter as they fall. City below: distant warm amber street lights vs cold electric blue screen glow. Rain-slicked reflections on glass towers. Editorial photography style, ultra-sharp, photorealistic, 16:9 cinematic widescreen, dramatic chiaroscuro, film grain. Palette: deep navy black, warm amber, cold electric blue.',
  },
  2: {
    title: 'Fundadores — Visão e Determinação',
    needsRef: 'Matheus + Vilson',
    prompt: 'Cinematic portrait of two Brazilian startup co-founders side by side in a modern home office at night. Left (MATHEUS): curly dark brown hair, dark brown eyes, well-groomed goatee beard, warm olive skin, athletic build, charcoal grey button overshirt over black t-shirt, confident slight smirk, sharp camera gaze. Right (VILSON): straight jet-black hair swept to side undercut, dark brown eyes, clean-cut black goatee, light-medium tan skin, very muscular broad-shouldered build, navy blue button-up shirt, black smartband on left wrist, wide charismatic smile turning to determined conviction. Background: modern desk with monitors showing dashboards, city skyline at night through window, warm desk lamp + cool blue tech light. Both looking at camera: "we will change the game forever" energy. 16:9, shallow DoF, front-left key light, anamorphic flares, photorealistic.',
  },
  3: {
    title: 'Kairos — Sistema IA em Ação',
    prompt: 'Futuristic split-screen holographic interface in a dark tech room. Left panel: a glowing WhatsApp-style chat interface floating as a hologram, green text streams: "Lead qualificado", "Respondendo...", "Proposta enviada", 02:17 AM timestamp, lead scoring data. Right panel: a glowing futuristic hourglass symbol — neon blue at top transitioning through violet to magenta at base — pulsing, digital particles flowing through center. Between panels: data streams connecting them. Pure black background with subtle blue circuit grid. Colors: #00e5a0 green (left), #e040fb magenta + #7b2fff violet (right). Photorealistic render, ultra-sharp, 16:9 cinematic.',
  },
  4: {
    title: 'Cliente — Reação ao Bot às 2AM',
    prompt: 'Candid cinematic shot: Brazilian businessman, 45-50 years old, business casual, sitting at his office desk late at night. Holding smartphone with both hands, jaw dropped open, eyes wide in disbelief and amazement. Phone screen shows WhatsApp: "VENDA FECHADA ✓ R$12.400,00 — 02:17" — message from AI bot "Kairos". Expression: pure shock turning slowly to amazed smile. Dark office, single desk lamp creating warm light on face. Coffee mug on desk. Phone screen light illuminates face from below for dramatic bottom lighting. Photorealistic editorial photography, shallow DoF with bokeh, 16:9. Mood: "the AI actually closed a deal while I was sleeping."',
  },
  5: {
    title: 'Matheus — Close Dramático VO',
    needsRef: 'Matheus',
    prompt: 'Extreme cinematic close-up portrait of MATHEUS: Brazilian man 27yo, curly dark brown hair, dark brown almond eyes thick eyebrows, full goatee beard connected to mustache dark brown/black, warm olive skin, slightly angular jaw. Frame: face and upper shoulders only, filling 70% of frame. Lighting: dramatic single key light from front-left casting strong directional shadow, rim light from behind-right in electric blue/violet (#7b2fff). Background: pure dark gradient deep navy to black, very subtle purple/blue halo. Expression: intense direct camera gaze, extremely confident, slight asymmetric smirk — absolute authority and conviction, "the boss" shot. Photorealistic, ultra-sharp eyes, cinema portrait, anamorphic 2.39:1, moody contrast.',
  },
  6: {
    title: 'Logo Reveal — Kairos Digital',
    prompt: 'Epic brand reveal: Kairos Digital logo centered on near-black background (#040409). Logo: (1) futuristic 3D hourglass of neon light rails — electric blue (#00b4ff) top triangle, transitioning through violet (#7b2fff) to magenta (#e040fb) bottom triangle, glowing digital particle "sand" flowing through narrow center; (2) below hourglass: "KAIROS" in wide-spaced silver-chrome metallic uppercase letters, sleek industrial sans-serif; (3) below: "—DIGITAL—" in magenta (#e040fb) with thin horizontal flanking lines. Multi-color glow halo: blue top, violet center, magenta bottom. Subtle particle dust floating. Background: #040409 dark navy with barely visible circuit board grid. Premium brand reveal frame, ultra-sharp 3D render quality, 16:9, perfect symmetry.',
  },
}

// ─── Refs de imagem opcionais (GPT Image 2.5 gerados externamente) ─────────────
type ImageRefs = Record<string, string>
let imageRefs: ImageRefs = {}
const refsPath = resolve(process.cwd(), 'scripts/ep00-image-refs.json')
if (existsSync(refsPath)) {
  try {
    imageRefs = JSON.parse(readFileSync(refsPath, 'utf8')) as ImageRefs
    console.log('Referências de imagem carregadas:', Object.keys(imageRefs).map(k => `Cena ${k}`).join(', '))
  } catch { console.warn('ep00-image-refs.json inválido — ignorando.') }
}

// ─── Produção ─────────────────────────────────────────────────────────────────
type SceneResult = {
  scene: number
  title: string
  status: string
  videoUrl?: string
  error?: string
  needsRef?: string
  usedImageRef?: boolean
}

async function generateScene(sceneNum: number): Promise<SceneResult> {
  const scene = SCENES[sceneNum]
  const imageUrl = imageRefs[String(sceneNum)]
  const base: SceneResult = { scene: sceneNum, title: scene.title, status: 'pending', needsRef: scene.needsRef }

  const input: Record<string, unknown> = {
    prompt: scene.prompt,
    duration: 5,
    resolution: '720p',
    aspect_ratio: '16:9',
    generate_audio: true,
  }

  // Cenas com imageUrl usam image-to-video (mais fiel à referência visual)
  // Cenas sem imageUrl usam text-to-video
  const endpoint = imageUrl
    ? 'bytedance/seedance-2.5/image-to-video'
    : 'bytedance/seedance-2.5/text-to-video'

  if (imageUrl) {
    input['image_url'] = imageUrl
    base.usedImageRef = true
    console.log(`  Cena ${sceneNum}: image-to-video com referência`)
  } else if (scene.needsRef) {
    console.log(`  Cena ${sceneNum}: text-to-video (sem foto de referência para ${scene.needsRef})`)
  }

  try {
    const result = await higgsfield.subscribe(endpoint, {
      input,
      withPolling: true,
    })

    if (result.status === 'completed') {
      const url = result.video?.url
      return { ...base, status: 'completed', videoUrl: url }
    } else if (result.status === 'failed') {
      return { ...base, status: 'failed', error: JSON.stringify(result) }
    } else if (result.status === 'nsfw') {
      return { ...base, status: 'nsfw', error: 'Conteúdo bloqueado por moderação' }
    } else {
      return { ...base, status: result.status, error: 'Status inesperado: ' + result.status }
    }
  } catch (err) {
    return { ...base, status: 'error', error: String(err) }
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════')
  console.log('  EP00 — TRAILER KAIROS DIGITAL · PRODUÇÃO REAL')
  console.log('  6 cenas × 5s = 30s · Seedance 2.5 · 720p 16:9')
  console.log('═══════════════════════════════════════════════════\n')

  const results: SceneResult[] = []
  const sceneNums = [1, 2, 3, 4, 5, 6]

  for (const num of sceneNums) {
    const scene = SCENES[num]
    console.log(`[${num}/6] Gerando: ${scene.title}`)
    const result = await generateScene(num)
    results.push(result)

    if (result.status === 'completed') {
      console.log(`  ✓ Concluído: ${result.videoUrl ?? 'sem URL'}`)
    } else {
      console.error(`  ✗ ${result.status}: ${result.error ?? ''}`)
    }

    // Pausa entre cenas pra não sobrecarregar a fila
    if (num < 6) await new Promise(r => setTimeout(r, 2000))
  }

  // ─── Relatório ───────────────────────────────────────────────────────────────
  const outputPath = resolve(process.cwd(), 'scripts/ep00-result.json')
  writeFileSync(outputPath, JSON.stringify({ generatedAt: new Date().toISOString(), scenes: results }, null, 2))

  console.log('\n═══════════════════════════════════════════════════')
  console.log('  RESULTADO EP00')
  console.log('═══════════════════════════════════════════════════')
  for (const r of results) {
    const status = r.status === 'completed' ? '✓' : '✗'
    console.log(`${status} Cena ${r.scene} · ${r.title}`)
    if (r.videoUrl) console.log(`    ${r.videoUrl}`)
    if (r.error)    console.log(`    ERRO: ${r.error}`)
    if (r.needsRef && !r.usedImageRef) console.log(`    ⚠ Gerado sem foto de referência (${r.needsRef})`)
  }

  const completed = results.filter(r => r.status === 'completed').length
  console.log(`\n${completed}/6 cenas concluídas`)
  console.log(`Resultado salvo em: ${outputPath}`)

  if (completed < 6) process.exit(1)
}

main().catch(err => { console.error(err); process.exit(1) })
