import test from 'node:test'
import assert from 'node:assert/strict'
import { MAX_INPUT_BYTES, MAX_RENDER_SECONDS, outputDimensions, safeOutputName, selectRecorderMime, validateRenderPlan } from '../src/engines/video/renderPlan.ts'
import { compileStoryboard, generationDuration, validateGenerationPlan } from '../src/engines/video/storyboard.ts'
import { buildConversionScript, estimateCampaign } from '../src/engines/video/providerCatalog.ts'
import { distributionManifest, validateXCaption, xComposeUrl } from '../src/engines/video/distributionPackage.ts'

const plan = { title: 'Reel Kairos', startSeconds: 3, endSeconds: 33, aspect: '9:16', quality: 'balanced', watermark: '@_kairosdigital_', includeAudio: true, musicVolume: .15 }

test('render plan accepts a real bounded local job and rejects unsafe intervals', () => {
  assert.equal(validateRenderPlan(plan, 60, 10_000_000), '')
  assert.match(validateRenderPlan({ ...plan, endSeconds: 2 }, 60, 10_000_000), /início anterior/)
  assert.match(validateRenderPlan({ ...plan, endSeconds: MAX_RENDER_SECONDS + 4 }, MAX_RENDER_SECONDS + 10, 10_000_000), /10 minutos/)
  assert.match(validateRenderPlan(plan, 60, MAX_INPUT_BYTES + 1), /500 MB/)
  assert.match(validateRenderPlan({ ...plan, musicVolume: 1.1 }, 60, 10_000_000), /cem por cento/)
})

test('output presets are bounded, even-sized and preserve original ratio', () => {
  assert.deepEqual(outputDimensions(1920, 1080, '9:16', 'balanced'), { width: 406, height: 720 })
  assert.deepEqual(outputDimensions(1920, 1080, '1:1', 'high'), { width: 1080, height: 1080 })
  assert.deepEqual(outputDimensions(1280, 720, 'original', 'high'), { width: 1280, height: 720 })
  assert.throws(() => outputDimensions(0, 720, 'original', 'balanced'))
})

test('download names remove path-like characters and codecs degrade predictably', () => {
  assert.equal(safeOutputName('Vídeo / Founder: 01', 'source.mp4'), 'Video-Founder-01.webm')
  assert.equal(safeOutputName('', 'meu arquivo.mov'), 'meu-arquivo.webm')
  assert.equal(selectRecorderMime(mime => mime.includes('vp8')), 'video/webm;codecs=vp8,opus')
  assert.equal(selectRecorderMime(() => false), '')
})

const generation = { title: 'Kairos AGI', script: 'Sua empresa precisa agir. A Kairos organiza prioridades. Você aprova e o sistema executa.', aspect: '9:16', quality: 'balanced', style: 'kairos', secondsPerScene: 4, watermark: '@_kairosdigital_', soundtrack: true }

test('storyboard compiles founder copy into deterministic scenes without input media', () => {
  const scenes = compileStoryboard(generation)
  assert.equal(scenes.length, 3)
  assert.equal(scenes[0].kicker, 'Kairos AGI')
  assert.equal(generationDuration(scenes), 12)
  assert.deepEqual(compileStoryboard(generation), scenes)
})

test('generation rejects empty, oversized and unsafe timing plans', () => {
  assert.equal(validateGenerationPlan(generation), '')
  assert.match(validateGenerationPlan({ ...generation, title: '' }), /título/)
  assert.match(validateGenerationPlan({ ...generation, script: 'curto' }), /roteiro/)
  assert.match(validateGenerationPlan({ ...generation, secondsPerScene: 3 }), /4 e 8/)
  assert.equal(compileStoryboard({ ...generation, script: '' }).length, 0)
})

test('manual X package uses a real stored video and never marks it published', () => {
  const video = { id: 'v1', name: 'kairos.webm', createdAt: '2026-09-11T12:00:00Z', durationSeconds: 8, width: 720, height: 1280, mimeType: 'video/webm', bytes: 1200, kind: 'generated', blob: new Blob() }
  assert.equal(validateXCaption(''), 'Escreva o texto que acompanhará o vídeo.')
  assert.match(xComposeUrl('Kairos Digital: produção inteligente.'), /^https:\/\/x\.com\/intent\/post\?text=/)
  const manifest = JSON.parse(distributionManifest(video, 'Kairos Digital: produção inteligente.'))
  assert.equal(manifest.video.name, 'kairos.webm')
  assert.equal(manifest.published, false)
  assert.equal(manifest.mode, 'manual-free')
})

test('campaign estimator exposes zero-cost local mode and deterministic paid estimates', () => {
  const base = { product: 'Kairos AGI', audience: 'donos de empresas', promise: 'organiza a operação', proof: 'painel único', callToAction: 'Fale com a Kairos', durationSeconds: 30, videoModelId: 'browser-local', imageModelId: 'runway-gemini-2.5-flash', imageCount: 6 }
  assert.deepEqual(estimateCampaign(base), { videoUsd: 0, imagesUsd: .3, totalUsd: .3, status: 'estimate' })
  assert.deepEqual(estimateCampaign({ ...base, imageCount: 0 }), { videoUsd: 0, imagesUsd: 0, totalUsd: 0, status: 'free' })
  assert.deepEqual(estimateCampaign({ ...base, videoModelId: 'runway-gen4-turbo' }), { videoUsd: 1.5, imagesUsd: .3, totalUsd: 1.8, status: 'estimate' })
})

test('conversion script only uses real brief fields supplied by the founder', () => {
  const brief = { product: 'Kairos AGI', audience: 'donos de empresas', promise: 'organiza a operação', proof: 'painel único', callToAction: 'Fale com a Kairos', durationSeconds: 30, videoModelId: 'browser-local', imageModelId: 'runway-gemini-2.5-flash', imageCount: 6 }
  const script = buildConversionScript(brief)
  assert.match(script, /donos de empresas/)
  assert.match(script, /painel único/)
  assert.equal(buildConversionScript({ ...brief, product: '' }), '')
  assert.equal(buildConversionScript({ ...brief, durationSeconds: 8 }).split('\n').length, 2)
})
