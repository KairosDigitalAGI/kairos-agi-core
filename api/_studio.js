// Estúdio Kairos (Missão 006, Fase 16) — personagens, reels e cenas sobre
// command.characters/reels/scenes/studio_spend (supabase/migrations/0025_estudio_kairos.sql,
// ainda não aplicada em produção pelo Founder). Mesmo espírito de api/_content.js:
// nunca inventa dado, sempre reporta "indisponível" com o motivo real até a
// migration ser aplicada.
//
// Guarda de orçamento: TODA geração paga do Estúdio (retrato de personagem via
// fal.ai por enquanto; vídeo de cena fica para uma fase futura) passa por
// assertBudgetAvailable() ANTES de chamar qualquer provider — soma
// command.studio_spend (ledger append-only) e recusa (402) se o gasto
// projetado estourar o teto STUDIO_BUDGET_USD. Sem STUDIO_BUDGET_USD
// configurado, o guard falha fechado (503): nenhuma geração paga roda sem um
// teto explícito definido pelo Founder — mesma filosofia de aprovado:true no
// Content Engine, aplicada a orçamento em vez de por-job.
import { readCommand, writeCommand, patchCommand, commandConfigured } from './_command.js'
import { uploadToStorage, safePath } from './_storage.js'
import * as fal from './_providers/fal.js'

const MIGRATION_HINT =
  'A migration supabase/migrations/0025_estudio_kairos.sql (kairos-agi-core, ainda não copiada para kairos-command nem aplicada em produção) precisa ser aplicada no SQL Editor do Supabase para ativar o Estúdio Kairos.'

// Estimativas de custo, não preço travado — fal.ai cobra flux/schnell por
// megapixel gerado e não devolve o custo exato na resposta da fila. Valores
// conservadores (levemente acima do preço público de lançamento) para o
// guard nunca subestimar o gasto real. Configuráveis por env var para o
// Founder ajustar sem depender de deploy quando o preço oficial mudar.
const CUSTO_ESTIMADO_IMAGEM_USD = Number(process.env.STUDIO_CUSTO_IMAGEM_USD) || 0.003
const CUSTO_ESTIMADO_VIDEO_USD = Number(process.env.STUDIO_CUSTO_VIDEO_USD) || 0.35

function studioBudgetUsd() {
  const raw = process.env.STUDIO_BUDGET_USD
  if (raw === undefined || raw === '') return null
  const n = Number(raw)
  return Number.isFinite(n) && n >= 0 ? n : null
}

export async function computeStudioSpend() {
  if (!commandConfigured()) {
    return { source: 'unavailable', reason: 'SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY não configuradas nesta implantação.', totalUsd: 0 }
  }
  try {
    const rows = await readCommand('studio_spend', '?select=custo_usd')
    const totalUsd = (rows || []).reduce((sum, r) => sum + Number(r.custo_usd || 0), 0)
    return { source: 'real', totalUsd }
  } catch (e) {
    return { source: 'unavailable', reason: `${MIGRATION_HINT} (${e.message})`, totalUsd: 0 }
  }
}

/**
 * Recusa (402) quando gastar `estimatedCostUsd` a mais estouraria
 * STUDIO_BUDGET_USD. Recusa (503) quando o teto não está configurado ou o
 * ledger está indisponível — nunca deixa passar "sem saber".
 */
export async function assertBudgetAvailable(estimatedCostUsd) {
  const budget = studioBudgetUsd()
  if (budget === null) {
    const err = new Error(
      'STUDIO_BUDGET_USD não configurado (ou inválido) na Vercel — nenhuma geração paga do Estúdio Kairos roda sem um teto de orçamento explícito.',
    )
    err.status = 503
    throw err
  }
  const spend = await computeStudioSpend()
  if (spend.source === 'unavailable') {
    const err = new Error(spend.reason)
    err.status = 503
    throw err
  }
  const projetado = spend.totalUsd + estimatedCostUsd
  if (projetado > budget) {
    const err = new Error(
      `orçamento do Estúdio Kairos estourado: já gasto $${spend.totalUsd.toFixed(4)} + estimado $${estimatedCostUsd.toFixed(4)} ultrapassa o teto STUDIO_BUDGET_USD=$${budget.toFixed(2)}.`,
    )
    err.status = 402
    throw err
  }
  return { spentUsd: spend.totalUsd, budgetUsd: budget, projetadoUsd: projetado }
}

async function registrarGasto({ reelId, sceneId, characterId, tipo, provedor, modelo, custoUsd }) {
  await writeCommand('studio_spend', {
    reel_id: reelId || null,
    scene_id: sceneId || null,
    character_id: characterId || null,
    tipo,
    provedor,
    modelo: modelo || null,
    custo_usd: custoUsd,
  })
}

// --- Personagens ---------------------------------------------------------

export async function listCharacters() {
  if (!commandConfigured()) return { source: 'unavailable', reason: 'SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY não configuradas nesta implantação.', characters: [] }
  try {
    const characters = await readCommand('characters', '?select=*&order=criado_em.desc&limit=100')
    return { source: 'real', characters }
  } catch (e) {
    return { source: 'unavailable', reason: `${MIGRATION_HINT} (${e.message})`, characters: [] }
  }
}

export async function createCharacter({ nome, descricao, promptVisual, criadoPor }) {
  if (typeof nome !== 'string' || !nome.trim()) {
    const err = new Error('nome é obrigatório')
    err.status = 400
    throw err
  }
  if (typeof promptVisual !== 'string' || !promptVisual.trim()) {
    const err = new Error('promptVisual é obrigatório — é o que garante a mesma aparência em toda cena deste personagem')
    err.status = 400
    throw err
  }
  if (!commandConfigured()) {
    const err = new Error('SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY não configuradas nesta implantação.')
    err.status = 503
    throw err
  }
  try {
    const [character] = await writeCommand('characters', {
      nome,
      descricao: descricao || null,
      prompt_visual: promptVisual,
      criado_por: criadoPor || null,
    })
    return character
  } catch (e) {
    const err = new Error(`${MIGRATION_HINT} (${e.message})`)
    err.status = 503
    throw err
  }
}

/**
 * Gera o retrato de referência de um personagem via fal.ai (flux/schnell) —
 * ÚNICA chamada paga hoje neste módulo. Passa pelo budget guard antes de
 * chamar o provider; baixa o resultado do CDN da fal e sobe no bucket
 * "studio" deste Core (não referencia a URL externa da fal, que expira).
 */
export async function generateCharacterPortrait({ characterId }) {
  if (typeof characterId !== 'string' || !characterId.trim()) {
    const err = new Error('characterId é obrigatório')
    err.status = 400
    throw err
  }
  if (!commandConfigured()) {
    const err = new Error('SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY não configuradas nesta implantação.')
    err.status = 503
    throw err
  }
  let character
  try {
    const rows = await readCommand('characters', `?select=id,nome,prompt_visual&id=eq.${encodeURIComponent(characterId)}&limit=1`)
    character = rows?.[0]
  } catch (e) {
    const err = new Error(`${MIGRATION_HINT} (${e.message})`)
    err.status = 503
    throw err
  }
  if (!character) {
    const err = new Error(`character ${characterId} não encontrado.`)
    err.status = 404
    throw err
  }
  if (!fal.hasCredentials()) {
    const err = new Error('nenhum provider de imagem do Estúdio configurado: defina FAL_KEY na Vercel (flux/schnell roda via fal.ai).')
    err.status = 503
    throw err
  }

  await assertBudgetAvailable(CUSTO_ESTIMADO_IMAGEM_USD)

  const prompt = `${character.prompt_visual}. Retrato de referência, corpo inteiro ou meio corpo, fundo neutro, alta consistência visual para reaproveitar em outras cenas.`

  let resultado
  try {
    resultado = await fal.generateImage({ prompt, model: fal.MODEL_IMAGE_CHARACTER })
  } catch (e) {
    const err = new Error(`provider fal: ${e.message}`)
    err.status = e.status && e.status >= 400 && e.status < 600 ? e.status : 502
    throw err
  }

  let imagemBuffer
  try {
    const imagemRes = await fetch(resultado.url)
    if (!imagemRes.ok) throw new Error(`HTTP ${imagemRes.status}`)
    imagemBuffer = Buffer.from(await imagemRes.arrayBuffer())
  } catch (e) {
    const err = new Error(`falha ao baixar o retrato gerado (${resultado.url}) para subir no Storage: ${e.message}`)
    err.status = 502
    throw err
  }

  const path = `characters/${character.id}/${safePath(`retrato-${Date.now()}.png`)}`
  let storagePath
  try {
    storagePath = await uploadToStorage(path, imagemBuffer, 'image/png', 'studio')
  } catch (e) {
    const err = new Error(
      `falha ao gravar o retrato no Supabase Storage — confira se a migration 0025_estudio_kairos.sql já foi aplicada (cria o bucket "studio"). (${e.message})`,
    )
    err.status = 503
    throw err
  }

  try {
    await registrarGasto({ characterId: character.id, tipo: 'imagem', provedor: 'fal', modelo: resultado.model, custoUsd: CUSTO_ESTIMADO_IMAGEM_USD })
    const [updated] = await patchCommand('characters', `?id=eq.${encodeURIComponent(character.id)}`, {
      imagem_referencia_path: storagePath,
      status: 'ativo',
    })
    return updated || { ...character, imagem_referencia_path: storagePath, status: 'ativo' }
  } catch (e) {
    const err = new Error(`${MIGRATION_HINT} (${e.message}) — o retrato já foi gerado e subiu no Storage (${storagePath}), só o registro falhou.`)
    err.status = 503
    throw err
  }
}

// --- Reels -----------------------------------------------------------------

export async function listReels() {
  if (!commandConfigured()) return { source: 'unavailable', reason: 'SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY não configuradas nesta implantação.', reels: [] }
  try {
    const reels = await readCommand('reels', '?select=*&order=criado_em.desc&limit=100')
    return { source: 'real', reels }
  } catch (e) {
    return { source: 'unavailable', reason: `${MIGRATION_HINT} (${e.message})`, reels: [] }
  }
}

// Estimativa simples e conservadora: uma geração de vídeo por cena (o custo
// dominante do reel — o retrato de personagem é reaproveitado entre cenas,
// não é gerado de novo por cena). Mostrada no painel ANTES do Founder
// aprovar, nunca depois.
export function estimateReelCostUsd(numScenes) {
  const n = Number(numScenes) || 0
  return Math.max(0, n) * CUSTO_ESTIMADO_VIDEO_USD
}

export async function createReel({ titulo, characterId, briefing, criadoPor, numScenesEstimado }) {
  if (typeof titulo !== 'string' || !titulo.trim()) {
    const err = new Error('titulo é obrigatório')
    err.status = 400
    throw err
  }
  if (!commandConfigured()) {
    const err = new Error('SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY não configuradas nesta implantação.')
    err.status = 503
    throw err
  }
  try {
    const [reel] = await writeCommand('reels', {
      titulo,
      character_id: characterId || null,
      briefing: briefing && typeof briefing === 'object' ? briefing : {},
      custo_estimado_usd: estimateReelCostUsd(numScenesEstimado || 0),
      criado_por: criadoPor || null,
    })
    return reel
  } catch (e) {
    const err = new Error(`${MIGRATION_HINT} (${e.message})`)
    err.status = 503
    throw err
  }
}

/**
 * Gate do Founder — mesma convenção de approveContentJob (0020/api/_content.js):
 * ação explícita e separada, nunca em lote. Sem isso nenhuma geração paga de
 * cena (fase futura) pode rodar para este reel.
 */
export async function approveReel({ reelId, aprovadoPor }) {
  if (typeof reelId !== 'string' || !reelId.trim()) {
    const err = new Error('reelId é obrigatório')
    err.status = 400
    throw err
  }
  if (!commandConfigured()) {
    const err = new Error('SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY não configuradas nesta implantação.')
    err.status = 503
    throw err
  }
  let rows
  try {
    rows = await readCommand('reels', `?select=id&id=eq.${encodeURIComponent(reelId)}&limit=1`)
  } catch (e) {
    const err = new Error(`${MIGRATION_HINT} (${e.message})`)
    err.status = 503
    throw err
  }
  if (!rows?.[0]) {
    const err = new Error(`reel ${reelId} não encontrado.`)
    err.status = 404
    throw err
  }
  try {
    const [reel] = await patchCommand('reels', `?id=eq.${encodeURIComponent(reelId)}`, {
      aprovado: true,
      aprovado_por: aprovadoPor || null,
      aprovado_em: new Date().toISOString(),
      etapa: 'aprovacao',
    })
    return reel
  } catch (e) {
    const err = new Error(`${MIGRATION_HINT} (${e.message})`)
    err.status = 503
    throw err
  }
}

// --- Cenas -------------------------------------------------------------

export async function listScenes({ reelId }) {
  if (typeof reelId !== 'string' || !reelId.trim()) {
    const err = new Error('reelId é obrigatório')
    err.status = 400
    throw err
  }
  if (!commandConfigured()) return { source: 'unavailable', reason: 'SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY não configuradas nesta implantação.', scenes: [] }
  try {
    const scenes = await readCommand('scenes', `?select=*&reel_id=eq.${encodeURIComponent(reelId)}&order=ordem.asc`)
    return { source: 'real', scenes }
  } catch (e) {
    return { source: 'unavailable', reason: `${MIGRATION_HINT} (${e.message})`, scenes: [] }
  }
}

export async function addScene({ reelId, ordem, roteiro, promptVideo }) {
  if (typeof reelId !== 'string' || !reelId.trim()) {
    const err = new Error('reelId é obrigatório')
    err.status = 400
    throw err
  }
  if (!commandConfigured()) {
    const err = new Error('SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY não configuradas nesta implantação.')
    err.status = 503
    throw err
  }
  try {
    const [scene] = await writeCommand('scenes', {
      reel_id: reelId,
      ordem: Number(ordem) || 1,
      roteiro: roteiro || null,
      prompt_video: promptVideo || null,
    })
    return scene
  } catch (e) {
    const err = new Error(`${MIGRATION_HINT} (${e.message})`)
    err.status = 503
    throw err
  }
}
