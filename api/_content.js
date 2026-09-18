// Cálculos e escrita reais sobre o pipeline de conteúdo (Missão 006, Fase 3)
// — command.content_jobs/content_assets/content_calendar/avatars/prompt_library,
// schema desenhado em kairos-command/supabase/migrations/0020_content_engine.sql
// mas AINDA NÃO aplicado em produção pelo Founder (o SQL fica pronto pra colar
// no SQL Editor do Supabase, mesmo padrão de outras migrations pendentes desta
// conta). Até lá, toda leitura/escrita aqui reporta "indisponível" com o
// motivo real — nunca inventa job, etapa ou número.
import { readCommand, writeCommand, patchCommand, commandConfigured } from './_command.js'
import { selectProvider } from './_providers/index.js'
import * as openai from './_providers/openai.js'
import * as fal from './_providers/fal.js'
import { uploadToStorage, safePath } from './_storage.js'
import { getValidAccessToken, uploadVideo } from './_youtube.js'
import { getValidInstagramAccess, createReelsContainer, checkContainerStatus, publishReelsContainer } from './_instagram.js'

const MIGRATION_HINT =
  'A migration supabase/migrations/0020_content_engine.sql (repo kairos-command) ainda não foi aplicada em produção — colar no SQL Editor do Supabase para ativar o Content Engine.'

// O plano do Founder é custo zero. Um job historicamente marcado como
// aprovado não libera chamadas pagas nesta implantação.
function assertPaidMediaEnabled() {
  if (process.env.KAIROS_ENABLE_PAID_MEDIA !== 'true') {
    const err = new Error('Geração por API paga está desligada no modo custo zero. Use Google Flow com créditos gratuitos ou a Video Engine local.')
    err.status = 402
    throw err
  }
}

// Lidas a cada chamada (não numa const de módulo), mesma convenção de
// api/_providers/fal.js#pollIntervalMs/pollTimeoutMs — assim os testes
// conseguem acelerar o polling do container do Reels via env var sem
// depender da ordem de import.
function instagramPollIntervalMs() {
  return Number(process.env.INSTAGRAM_POLL_INTERVAL_MS) || 3000
}
function instagramPollMaxTentativas() {
  return Number(process.env.INSTAGRAM_POLL_MAX_TENTATIVAS) || 8
}

export async function computeContentPipeline() {
  if (!commandConfigured()) {
    return { source: 'unavailable', reason: 'SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY não configuradas nesta implantação.', jobs: [], porEtapa: {} }
  }
  try {
    const jobs = await readCommand('content_jobs', '?select=id,titulo,etapa,aprovado,criado_em&order=criado_em.desc&limit=50')
    const porEtapa = jobs.reduce((acc, job) => {
      acc[job.etapa] = (acc[job.etapa] || 0) + 1
      return acc
    }, {})
    return { source: 'real', checkedAt: new Date().toISOString(), jobs, porEtapa }
  } catch (e) {
    return { source: 'unavailable', reason: `${MIGRATION_HINT} (${e.message})`, jobs: [], porEtapa: {} }
  }
}

/**
 * Aprova o gasto de geração paga de UM job — ação explícita e separada do
 * clique "Gerar roteiro". Grava `aprovado:true`/`aprovado_por`/`aprovado_em`
 * em content_jobs. Sem isso, `generateScript` recusa chamar qualquer
 * provider pago (ver comentário em command.content_assets.gratuito na
 * migration 0020: "Geração paga só existe quando o job carrega aprovado:true
 * explícito do Founder" — regra do próprio schema, não só do código).
 */
export async function approveContentJob({ jobId, aprovadoPor }) {
  if (typeof jobId !== 'string' || !jobId.trim()) {
    const err = new Error('jobId é obrigatório')
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
    rows = await readCommand('content_jobs', `?select=id&id=eq.${encodeURIComponent(jobId)}&limit=1`)
  } catch (e) {
    const err = new Error(`${MIGRATION_HINT} (${e.message})`)
    err.status = 503
    throw err
  }
  if (!rows?.[0]) {
    const err = new Error(`content_job ${jobId} não encontrado.`)
    err.status = 404
    throw err
  }
  try {
    const [job] = await patchCommand('content_jobs', `?id=eq.${encodeURIComponent(jobId)}`, {
      aprovado: true,
      aprovado_por: aprovadoPor || null,
      aprovado_em: new Date().toISOString(),
    })
    return job
  } catch (e) {
    const err = new Error(`${MIGRATION_HINT} (${e.message})`)
    err.status = 503
    throw err
  }
}

export async function createContentJob({ titulo, briefing, criadoPor }) {
  if (!commandConfigured()) {
    const err = new Error('SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY não configuradas nesta implantação.')
    err.status = 503
    throw err
  }
  try {
    const [job] = await writeCommand('content_jobs', {
      titulo,
      briefing: briefing && typeof briefing === 'object' ? briefing : {},
      criado_por: criadoPor || null,
    })
    return job
  } catch (e) {
    const err = new Error(`${MIGRATION_HINT} (${e.message})`)
    err.status = 503
    throw err
  }
}

/**
 * Gera o roteiro de um job em etapa "ideia" e avança para "roteiro".
 *
 * Só roda quando o Founder aciona explicitamente (botão "Gerar roteiro" no
 * painel) — nunca em lote, nunca automático. Mesma fronteira de autorização
 * já em produção desde a Fase 2 (chat de agentes): um clique do Founder por
 * chamada real ao provider pago, nunca geração disparada sozinha. Prioridade
 * de provider é a mesma de todo o Core (Anthropic/OpenAI pagos antes de
 * OpenRouter, decisão do Founder de 14/09/2026).
 */
export async function generateScript({ jobId, providerName }) {
  if (typeof jobId !== 'string' || !jobId.trim()) {
    const err = new Error('jobId é obrigatório')
    err.status = 400
    throw err
  }
  if (!commandConfigured()) {
    const err = new Error('SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY não configuradas nesta implantação.')
    err.status = 503
    throw err
  }

  let job
  try {
    const rows = await readCommand('content_jobs', `?select=id,titulo,etapa,briefing,aprovado&id=eq.${encodeURIComponent(jobId)}&limit=1`)
    job = rows?.[0]
  } catch (e) {
    const err = new Error(`${MIGRATION_HINT} (${e.message})`)
    err.status = 503
    throw err
  }
  if (!job) {
    const err = new Error(`content_job ${jobId} não encontrado.`)
    err.status = 404
    throw err
  }
  if (job.etapa !== 'ideia') {
    const err = new Error(`content_job ${jobId} está em etapa "${job.etapa}", não "ideia" — o roteiro já foi gerado ou o job avançou.`)
    err.status = 409
    throw err
  }
  if (!job.aprovado) {
    const err = new Error(
      `content_job ${jobId} ainda não foi aprovado para gasto (aprovado:false). O Founder precisa aprovar este job antes de gerar conteúdo com provider pago.`,
    )
    err.status = 402
    throw err
  }

  assertPaidMediaEnabled()

  let provider
  try {
    provider = selectProvider(providerName)
  } catch (e) {
    const err = new Error(e.message)
    err.status = 503
    throw err
  }

  const briefing = job.briefing && typeof job.briefing === 'object' ? job.briefing : {}
  const system = [
    'Você escreve roteiros curtos (30 a 60 segundos falados) para Shorts/Reels da Kairos Digital.',
    'Responda só com o roteiro em português do Brasil, sem comentário nem formatação markdown — cena por cena quando fizer sentido.',
    'O roteiro é sobre a ideia dada. Nunca invente dado de cliente, receita ou métrica real da empresa dentro do roteiro.',
  ].join('\n')
  const partesBriefing = Object.entries(briefing).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join('\n')
  const userContent = [`Título da ideia: ${job.titulo}`, partesBriefing && `Briefing:\n${partesBriefing}`].filter(Boolean).join('\n\n')

  let resultado
  try {
    resultado = await provider.chat({ system, messages: [{ role: 'user', content: userContent }], maxTokens: 700 })
  } catch (e) {
    const err = new Error(`provider ${provider.name}: ${e.message}`)
    err.status = e.status && e.status >= 400 && e.status < 600 ? e.status : 502
    throw err
  }

  try {
    const [asset] = await writeCommand('content_assets', {
      job_id: job.id,
      tipo: 'roteiro',
      conteudo: resultado.text,
      provedor: provider.name,
      gratuito: false,
      metadata: { model: resultado.model, usage: resultado.usage },
    })
    const [updatedJob] = await patchCommand('content_jobs', `?id=eq.${encodeURIComponent(job.id)}`, { etapa: 'roteiro' })
    return { job: updatedJob || { ...job, etapa: 'roteiro' }, asset }
  } catch (e) {
    const err = new Error(`${MIGRATION_HINT} (${e.message})`)
    err.status = 503
    throw err
  }
}

/**
 * Gera a imagem de capa de um job em etapa "roteiro" e avança para "imagem".
 *
 * Mesma fronteira de autorização de generateScript: um clique do Founder por
 * job, job já com aprovado:true (mesma aprovação de gasto cobre todas as
 * etapas pagas do job, não é uma aprovação por etapa). Só a OpenAI gera
 * imagem entre os providers deste Core — sem fallback para outro provider
 * quando OPENAI_API_KEY não está configurada, é a única fonte real.
 */
export async function generateImage({ jobId }) {
  if (typeof jobId !== 'string' || !jobId.trim()) {
    const err = new Error('jobId é obrigatório')
    err.status = 400
    throw err
  }
  if (!commandConfigured()) {
    const err = new Error('SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY não configuradas nesta implantação.')
    err.status = 503
    throw err
  }

  let job
  try {
    const rows = await readCommand('content_jobs', `?select=id,titulo,etapa,briefing,aprovado&id=eq.${encodeURIComponent(jobId)}&limit=1`)
    job = rows?.[0]
  } catch (e) {
    const err = new Error(`${MIGRATION_HINT} (${e.message})`)
    err.status = 503
    throw err
  }
  if (!job) {
    const err = new Error(`content_job ${jobId} não encontrado.`)
    err.status = 404
    throw err
  }
  if (job.etapa !== 'roteiro') {
    const err = new Error(`content_job ${jobId} está em etapa "${job.etapa}", não "roteiro" — gere o roteiro antes, ou a imagem já foi gerada.`)
    err.status = 409
    throw err
  }
  if (!job.aprovado) {
    const err = new Error(
      `content_job ${jobId} ainda não foi aprovado para gasto (aprovado:false). O Founder precisa aprovar este job antes de gerar conteúdo com provider pago.`,
    )
    err.status = 402
    throw err
  }

  assertPaidMediaEnabled()
  if (!openai.hasCredentials()) {
    const err = new Error('nenhum provider de geração de imagem configurado: defina OPENAI_API_KEY na Vercel (só a OpenAI gera imagem neste Core).')
    err.status = 503
    throw err
  }

  let roteiro
  try {
    const rows = await readCommand(
      'content_assets',
      `?select=conteudo&job_id=eq.${encodeURIComponent(job.id)}&tipo=eq.roteiro&order=criado_em.desc&limit=1`,
    )
    roteiro = rows?.[0]?.conteudo || ''
  } catch (e) {
    const err = new Error(`${MIGRATION_HINT} (${e.message})`)
    err.status = 503
    throw err
  }

  const briefing = job.briefing && typeof job.briefing === 'object' ? job.briefing : {}
  const prompt = [
    `Imagem de capa (thumbnail) fotorrealista para um Short/Reel da Kairos Digital, tema: ${job.titulo}.`,
    briefing.publico && `Público-alvo: ${briefing.publico}.`,
    roteiro && `Contexto do roteiro (não colocar texto do roteiro na imagem, só se inspirar): ${roteiro.slice(0, 400)}`,
    'Sem texto sobreposto, sem logotipo inventado, estilo profissional e moderno.',
  ].filter(Boolean).join(' ')

  let resultado
  try {
    resultado = await openai.generateImage({ prompt })
  } catch (e) {
    const err = new Error(`provider openai: ${e.message}`)
    err.status = e.status && e.status >= 400 && e.status < 600 ? e.status : 502
    throw err
  }

  const path = `content-jobs/${job.id}/${safePath(`imagem-${Date.now()}.png`)}`
  let storagePath
  try {
    storagePath = await uploadToStorage(path, Buffer.from(resultado.b64, 'base64'), 'image/png')
  } catch (e) {
    const err = new Error(
      `falha ao gravar a imagem no Supabase Storage — confira se a migration supabase/migrations/0022_content_assets_bucket.sql (repo kairos-command) já foi aplicada em produção. (${e.message})`,
    )
    err.status = 503
    throw err
  }

  try {
    const [asset] = await writeCommand('content_assets', {
      job_id: job.id,
      tipo: 'imagem',
      storage_path: storagePath,
      provedor: 'openai',
      gratuito: false,
      metadata: { model: resultado.model, prompt },
    })
    const [updatedJob] = await patchCommand('content_jobs', `?id=eq.${encodeURIComponent(job.id)}`, { etapa: 'imagem' })
    return { job: updatedJob || { ...job, etapa: 'imagem' }, asset }
  } catch (e) {
    const err = new Error(`${MIGRATION_HINT} (${e.message})`)
    err.status = 503
    throw err
  }
}

/**
 * Gera o vídeo de um job em etapa "imagem" e avança para "video".
 *
 * A API Veo não oferece faixa gratuita; tier="free" é recusado. A produção
 * gratuita ocorre na interface oficial do Google Flow e o arquivo gerado
 * pode ser importado na galeria local. tier="paid" usa Kling v2.1 Master,
 * somente com aprovação do job e KAIROS_ENABLE_PAID_MEDIA=true.
 *
 * O vídeo não é baixado para o Storage deste Core: a URL que o provider
 * devolve é gravada direto em content_assets.storage_path (pode ser externa,
 * ao contrário da imagem que sobe para o bucket content-assets). Fase 8
 * (post no YouTube) busca o binário direto dessa URL — por isso ela deve ser
 * consumida logo após gerada, antes de expirar.
 */
export async function generateVideo({ jobId, tier = 'free' }) {
  if (typeof jobId !== 'string' || !jobId.trim()) {
    const err = new Error('jobId é obrigatório')
    err.status = 400
    throw err
  }
  if (tier !== 'free' && tier !== 'paid') {
    const err = new Error(`tier inválido: "${tier}" (use "free" ou "paid")`)
    err.status = 400
    throw err
  }
  if (!commandConfigured()) {
    const err = new Error('SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY não configuradas nesta implantação.')
    err.status = 503
    throw err
  }

  let job
  try {
    const rows = await readCommand('content_jobs', `?select=id,titulo,etapa,briefing,aprovado&id=eq.${encodeURIComponent(jobId)}&limit=1`)
    job = rows?.[0]
  } catch (e) {
    const err = new Error(`${MIGRATION_HINT} (${e.message})`)
    err.status = 503
    throw err
  }
  if (!job) {
    const err = new Error(`content_job ${jobId} não encontrado.`)
    err.status = 404
    throw err
  }
  if (job.etapa !== 'imagem') {
    const err = new Error(`content_job ${jobId} está em etapa "${job.etapa}", não "imagem" — gere a imagem antes, ou o vídeo já foi gerado.`)
    err.status = 409
    throw err
  }
  if (tier === 'free') {
    const err = new Error('A API Veo não tem faixa gratuita. O modo zero custo usa os créditos diários do Google Flow na interface oficial e importa o MP4 para a galeria Kairos.')
    err.status = 402
    throw err
  }
  if (tier === 'paid' && !job.aprovado) {
    const err = new Error(
      `content_job ${jobId} ainda não foi aprovado para gasto (aprovado:false). O Founder precisa aprovar este job antes de gerar vídeo com o motor pago (Kling v2.1 Master).`,
    )
    err.status = 402
    throw err
  }

  assertPaidMediaEnabled()

  const briefing = job.briefing && typeof job.briefing === 'object' ? job.briefing : {}
  const prompt = [
    `Vídeo curto (Short/Reel) para a Kairos Digital, tema: ${job.titulo}.`,
    briefing.publico && `Público-alvo: ${briefing.publico}.`,
    briefing.promessa && `Promessa central: ${briefing.promessa}.`,
    'Estilo profissional e moderno, sem texto sobreposto, sem logotipo inventado.',
  ].filter(Boolean).join(' ')

  if (!fal.hasCredentials()) {
    const err = new Error('nenhum provider de vídeo pago configurado: defina FAL_KEY na Vercel (Kling v2.1 Master roda via fal.ai).')
    err.status = 503
    throw err
  }
  let resultado
  try {
    resultado = await fal.generateVideo({ prompt, model: fal.MODEL_PAID })
  } catch (e) {
    const err = new Error(`provider fal: ${e.message}`)
    err.status = e.status && e.status >= 400 && e.status < 600 ? e.status : 502
    throw err
  }
  const provedor = 'fal'
  const gratuito = false

  try {
    const [asset] = await writeCommand('content_assets', {
      job_id: job.id,
      tipo: 'video',
      storage_path: resultado.url,
      provedor,
      gratuito,
      metadata: { model: resultado.model, tier, prompt },
    })
    const [updatedJob] = await patchCommand('content_jobs', `?id=eq.${encodeURIComponent(job.id)}`, { etapa: 'video' })
    return { job: updatedJob || { ...job, etapa: 'video' }, asset }
  } catch (e) {
    const err = new Error(`${MIGRATION_HINT} (${e.message})`)
    err.status = 503
    throw err
  }
}

/**
 * Publica o vídeo de um job em etapa "video" no YouTube e avança para
 * "publicado" — a ação mais irreversível do pipeline até aqui: sai do
 * Supabase e vira um vídeo real no canal do Founder.
 *
 * Desvio deliberado e documentado do plano original da migration 0020: o
 * comentário de content_jobs diz "etapa=aprovacao é o gate do Founder; nada
 * publica antes disso" — mas as etapas legenda/aprovacao ainda não têm motor
 * (ninguém avança um job até lá). Em vez de deixar Fase 8 morta esperando
 * Fase 9/10, reaproveita o MESMO `content_jobs.aprovado` que já cobre todo o
 * gasto pago do job (mesma convenção da Fase 5/6/7: aprovação é por job
 * inteiro) como o sinal explícito do Founder para publicar também — postar
 * exige etapa="video" E aprovado:true, nunca um vídeo não aprovado. Quando a
 * etapa legenda/aprovacao ganhar motor de verdade, revisitar esta função
 * para gatear por etapa="aprovacao" em vez de reusar `aprovado`.
 *
 * Sobe com privacyStatus="private" por padrão (ver api/_youtube.js#uploadVideo)
 * — o vídeo existe no canal do Founder, mas só ele decide torná-lo público.
 */
export async function postToYoutube({ jobId, title, description, tags }) {
  if (typeof jobId !== 'string' || !jobId.trim()) {
    const err = new Error('jobId é obrigatório')
    err.status = 400
    throw err
  }
  if (!commandConfigured()) {
    const err = new Error('SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY não configuradas nesta implantação.')
    err.status = 503
    throw err
  }

  let job
  try {
    const rows = await readCommand('content_jobs', `?select=id,titulo,etapa,briefing,aprovado&id=eq.${encodeURIComponent(jobId)}&limit=1`)
    job = rows?.[0]
  } catch (e) {
    const err = new Error(`${MIGRATION_HINT} (${e.message})`)
    err.status = 503
    throw err
  }
  if (!job) {
    const err = new Error(`content_job ${jobId} não encontrado.`)
    err.status = 404
    throw err
  }
  if (job.etapa !== 'video') {
    const err = new Error(`content_job ${jobId} está em etapa "${job.etapa}", não "video" — gere o vídeo antes, ou o job já foi publicado.`)
    err.status = 409
    throw err
  }
  if (!job.aprovado) {
    const err = new Error(
      `content_job ${jobId} ainda não foi aprovado (aprovado:false). O Founder precisa aprovar este job antes de publicar no YouTube.`,
    )
    err.status = 402
    throw err
  }

  let asset
  try {
    const rows = await readCommand(
      'content_assets',
      `?select=id,storage_path&job_id=eq.${encodeURIComponent(job.id)}&tipo=eq.video&order=criado_em.desc&limit=1`,
    )
    asset = rows?.[0]
  } catch (e) {
    const err = new Error(`${MIGRATION_HINT} (${e.message})`)
    err.status = 503
    throw err
  }
  if (!asset?.storage_path) {
    const err = new Error(`content_job ${jobId} está em etapa "video" mas não tem nenhum content_asset de vídeo gravado — nada para publicar.`)
    err.status = 409
    throw err
  }

  let videoBuffer
  try {
    const videoRes = await fetch(asset.storage_path)
    if (!videoRes.ok) throw new Error(`HTTP ${videoRes.status}`)
    videoBuffer = Buffer.from(await videoRes.arrayBuffer())
  } catch (e) {
    const err = new Error(`falha ao baixar o vídeo gerado (${asset.storage_path}) para subir no YouTube: ${e.message}`)
    err.status = 502
    throw err
  }

  const accessToken = await getValidAccessToken()

  let resultado
  try {
    resultado = await uploadVideo({
      accessToken,
      title: title || job.titulo,
      description: description || (job.briefing?.promessa ? String(job.briefing.promessa) : ''),
      tags,
      videoBuffer,
    })
  } catch (e) {
    const err = new Error(`youtube: ${e.message}`)
    err.status = e.status && e.status >= 400 && e.status < 600 ? e.status : 502
    throw err
  }

  // Neste ponto o vídeo JÁ está no YouTube (resultado.videoId existe) — uma
  // falha daqui pra frente é só registro local desatualizado, nunca motivo
  // pra tentar subir de novo (duplicaria o vídeo no canal). Se a escrita
  // falhar, o erro cita o videoId real para o Founder conferir manualmente.
  try {
    await writeCommand('content_calendar', {
      asset_id: asset.id,
      canal: 'youtube',
      publicar_em: new Date().toISOString(),
      status: 'publicado',
      publicado_em: new Date().toISOString(),
      referencia_externa: resultado.videoId,
    })
    const [updatedJob] = await patchCommand('content_jobs', `?id=eq.${encodeURIComponent(job.id)}`, { etapa: 'publicado' })
    return { job: updatedJob || { ...job, etapa: 'publicado' }, videoId: resultado.videoId }
  } catch (e) {
    const err = new Error(`${MIGRATION_HINT} (${e.message}) — o vídeo já foi publicado no YouTube com id ${resultado.videoId}, só o registro em content_calendar/content_jobs falhou.`)
    err.status = 503
    throw err
  }
}

/**
 * Publica o vídeo aprovado como Reels no Instagram. Mesmo gate de
 * `postToYoutube` (etapa="video" && aprovado:true — ver comentário lá em
 * cima) e mesma fonte de vídeo (content_assets.storage_path, já público).
 *
 * Diferente do YouTube, a API do Instagram processa o vídeo de forma
 * assíncrona num "container": criar, esperar terminar de processar, só
 * depois publicar. Por isso o creation_id é gravado em content_calendar
 * (status "agendado", único valor do enum que serve pra "ainda não
 * publicado") ANTES de esperar — se a function for encerrada no meio da
 * espera, a PRÓXIMA chamada lê esse mesmo registro e retoma do mesmo
 * container, nunca cria um segundo nem duplica o Reels. A espera tem
 * orçamento curto (até ~24s por padrão — INSTAGRAM_POLL_INTERVAL_MS ×
 * INSTAGRAM_POLL_MAX_TENTATIVAS, mesma convenção de configurabilidade de
 * api/_providers/fal.js) pra não estourar o timeout da function; se o
 * Instagram ainda não terminou de processar, devolve status:"processando"
 * sem erro — o Founder clica de novo em instantes.
 */
export async function postToInstagram({ jobId, caption }) {
  if (typeof jobId !== 'string' || !jobId.trim()) {
    const err = new Error('jobId é obrigatório')
    err.status = 400
    throw err
  }
  if (!commandConfigured()) {
    const err = new Error('SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY não configuradas nesta implantação.')
    err.status = 503
    throw err
  }

  let job
  try {
    const rows = await readCommand('content_jobs', `?select=id,titulo,etapa,briefing,aprovado&id=eq.${encodeURIComponent(jobId)}&limit=1`)
    job = rows?.[0]
  } catch (e) {
    const err = new Error(`${MIGRATION_HINT} (${e.message})`)
    err.status = 503
    throw err
  }
  if (!job) {
    const err = new Error(`content_job ${jobId} não encontrado.`)
    err.status = 404
    throw err
  }
  if (job.etapa !== 'video') {
    const err = new Error(`content_job ${jobId} está em etapa "${job.etapa}", não "video" — gere o vídeo antes, ou o job já foi publicado.`)
    err.status = 409
    throw err
  }
  if (!job.aprovado) {
    const err = new Error(
      `content_job ${jobId} ainda não foi aprovado (aprovado:false). O Founder precisa aprovar este job antes de publicar no Instagram.`,
    )
    err.status = 402
    throw err
  }

  let asset
  try {
    const rows = await readCommand(
      'content_assets',
      `?select=id,storage_path&job_id=eq.${encodeURIComponent(job.id)}&tipo=eq.video&order=criado_em.desc&limit=1`,
    )
    asset = rows?.[0]
  } catch (e) {
    const err = new Error(`${MIGRATION_HINT} (${e.message})`)
    err.status = 503
    throw err
  }
  if (!asset?.storage_path) {
    const err = new Error(`content_job ${jobId} está em etapa "video" mas não tem nenhum content_asset de vídeo gravado — nada para publicar.`)
    err.status = 409
    throw err
  }

  // Idempotência: reaproveita o agendamento já criado pra este asset em vez
  // de abrir um segundo container a cada clique/retry.
  let agendamento
  try {
    const rows = await readCommand(
      'content_calendar',
      `?select=id,status,referencia_externa&asset_id=eq.${encodeURIComponent(asset.id)}&canal=eq.instagram&order=criado_em.desc&limit=1`,
    )
    agendamento = rows?.[0]
  } catch (e) {
    const err = new Error(`${MIGRATION_HINT} (${e.message})`)
    err.status = 503
    throw err
  }
  if (agendamento?.status === 'publicado') {
    const [updatedJob] = await patchCommand('content_jobs', `?id=eq.${encodeURIComponent(job.id)}`, { etapa: 'publicado' }).catch(() => [null])
    return { job: updatedJob || { ...job, etapa: 'publicado' }, mediaId: agendamento.referencia_externa, status: 'publicado' }
  }

  const { accessToken, igUserId } = await getValidInstagramAccess()

  let creationId = agendamento?.status === 'agendado' ? agendamento.referencia_externa : null
  if (!creationId) {
    try {
      creationId = await createReelsContainer({ accessToken, igUserId, videoUrl: asset.storage_path, caption: caption || job.titulo })
    } catch (e) {
      const err = new Error(`instagram: ${e.message}`)
      err.status = e.status && e.status >= 400 && e.status < 600 ? e.status : 502
      throw err
    }
    try {
      if (agendamento) {
        await patchCommand('content_calendar', `?id=eq.${encodeURIComponent(agendamento.id)}`, { referencia_externa: creationId, status: 'agendado' })
      } else {
        await writeCommand('content_calendar', {
          asset_id: asset.id,
          canal: 'instagram',
          publicar_em: new Date().toISOString(),
          status: 'agendado',
          referencia_externa: creationId,
        })
      }
    } catch (e) {
      const err = new Error(`${MIGRATION_HINT} (${e.message}) — o container ${creationId} já foi criado no Instagram, só o registro em content_calendar falhou.`)
      err.status = 503
      throw err
    }
  }

  let statusCode = 'IN_PROGRESS'
  const maxTentativas = instagramPollMaxTentativas()
  for (let tentativa = 0; tentativa < maxTentativas; tentativa += 1) {
    try {
      statusCode = await checkContainerStatus({ accessToken, creationId })
    } catch (e) {
      const err = new Error(`instagram: ${e.message}`)
      err.status = e.status && e.status >= 400 && e.status < 600 ? e.status : 502
      throw err
    }
    if (statusCode === 'FINISHED' || statusCode === 'ERROR' || statusCode === 'EXPIRED') break
    await new Promise((resolve) => setTimeout(resolve, instagramPollIntervalMs()))
  }

  if (statusCode === 'IN_PROGRESS') {
    return { job, status: 'processando', creationId }
  }
  if (statusCode !== 'FINISHED') {
    await patchCommand('content_calendar', `?asset_id=eq.${encodeURIComponent(asset.id)}&canal=eq.instagram`, { status: 'falhou' }).catch(() => {})
    const err = new Error(`instagram: o Reels não pôde ser processado (status ${statusCode}).`)
    err.status = 502
    throw err
  }

  let mediaId
  try {
    mediaId = await publishReelsContainer({ accessToken, igUserId, creationId })
  } catch (e) {
    const err = new Error(`instagram: ${e.message}`)
    err.status = e.status && e.status >= 400 && e.status < 600 ? e.status : 502
    throw err
  }

  // Neste ponto o Reels JÁ está publicado (mediaId existe) — mesma regra do
  // YouTube logo acima: uma falha daqui pra frente é só registro local
  // desatualizado, nunca motivo pra tentar de novo (duplicaria o Reels).
  try {
    await patchCommand('content_calendar', `?asset_id=eq.${encodeURIComponent(asset.id)}&canal=eq.instagram`, {
      status: 'publicado',
      publicado_em: new Date().toISOString(),
      referencia_externa: mediaId,
    })
    const [updatedJob] = await patchCommand('content_jobs', `?id=eq.${encodeURIComponent(job.id)}`, { etapa: 'publicado' })
    return { job: updatedJob || { ...job, etapa: 'publicado' }, mediaId, status: 'publicado' }
  } catch (e) {
    const err = new Error(`${MIGRATION_HINT} (${e.message}) — o Reels já foi publicado no Instagram com id ${mediaId}, só o registro em content_calendar/content_jobs falhou.`)
    err.status = 503
    throw err
  }
}
