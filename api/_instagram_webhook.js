// Instagram DM + comentários — recepção via webhook (Missão 006, Fase 17,
// item 4 do backlog noturno). Este módulo NUNCA envia nada de volta à Meta:
// gera no máximo um RASCUNHO de resposta (texto puro, gravado em
// command.instagram_webhook_events.resposta_sugerida) quando o Founder liga
// o interruptor auto_reply_enabled no painel — enviar de fato exige um fluxo
// de publicação real (POST /me/messages ou reply de comentário), que fica
// para uma sessão futura e está fora do escopo proibido de hoje ("nunca
// publicar/comentar/enviar DM real").
import { readCommand, writeCommand, upsertCommand, commandConfigured } from './_command.js'
import { createHmac, timingSafeEqual } from 'node:crypto'
import * as openrouter from './_providers/openrouter.js'

const MIGRATION_HINT = 'As tabelas command.integration_settings e command.instagram_webhook_events precisam existir no Supabase mestre (migration 0026).'

// --- Verificação da assinatura (Content Publishing/Webhooks da Meta) -------
// A Meta assina o corpo BRUTO da requisição com o App Secret; por isso a
// rota física (api/integrations/instagram-webhook.mjs) usa o handler Web
// Standard `fetch(request)` em vez do handler Node (request,response) do
// resto deste Core — só o primeiro dá acesso a request.text() com os bytes
// exatos, sem a normalização automática de req.body que os helpers da
// Vercel aplicam nos outros arquivos (ver comentário no arquivo de rota).
export function verifyWebhookSignature(rawBody, signatureHeader) {
  const secret = process.env.META_APP_SECRET
  if (!secret) {
    const err = new Error('META_APP_SECRET não configurado nesta implantação.')
    err.status = 503
    throw err
  }
  if (typeof signatureHeader !== 'string' || !signatureHeader.startsWith('sha256=')) {
    const err = new Error('Requisição sem X-Hub-Signature-256 válido.')
    err.status = 401
    throw err
  }
  const recebida = signatureHeader.slice('sha256='.length)
  const esperada = createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex')
  const a = Buffer.from(recebida, 'utf8')
  const b = Buffer.from(esperada, 'utf8')
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    const err = new Error('Assinatura do webhook não confere — requisição descartada.')
    err.status = 401
    throw err
  }
}

// --- Verificação inicial (GET, handshake de assinatura do webhook) --------
export function verifyWebhookChallenge({ mode, token, challenge }) {
  const esperado = process.env.META_WEBHOOK_VERIFY_TOKEN
  if (!esperado) {
    const err = new Error('META_WEBHOOK_VERIFY_TOKEN não configurado nesta implantação.')
    err.status = 503
    throw err
  }
  if (mode !== 'subscribe' || token !== esperado || typeof challenge !== 'string' || !challenge) {
    const err = new Error('hub.mode/hub.verify_token/hub.challenge inválidos.')
    err.status = 403
    throw err
  }
  return challenge
}

// --- Parsing do payload ------------------------------------------------
// Formato de "messaging" confirmado no exemplo oficial da doc do Messenger
// Platform para Instagram (developers.facebook.com/docs/messenger-platform/
// instagram/features/webhook): entry[].messaging[].{sender,recipient,
// timestamp,message.mid/text}. is_echo=true = mensagem que a PRÓPRIA conta
// mandou (ex.: se algum dia este Core enviar de verdade) — nunca tratado
// como recebido de um seguidor.
export function parseMessagingEvents(payload) {
  const entries = Array.isArray(payload?.entry) ? payload.entry : []
  const eventos = []
  for (const entry of entries) {
    const messaging = Array.isArray(entry?.messaging) ? entry.messaging : []
    for (const m of messaging) {
      if (!m?.message || m.message.is_echo) continue
      const texto = typeof m.message.text === 'string' ? m.message.text : null
      eventos.push({
        tipo: 'mensagem',
        remetenteId: m.sender?.id ? String(m.sender.id) : null,
        remetenteUsername: null,
        conteudo: texto,
        referenciaExterna: m.message.mid ? String(m.message.mid) : null,
      })
    }
  }
  return eventos
}

// Formato de "comments" reconstruído a partir do esquema de campos
// documentado em developers.facebook.com/docs/graph-api/webhooks/reference/
// instagram (a Meta não publica um payload de exemplo completo para este
// campo, só a lista de campos: field="comments", value.id/text/from.id/
// from.username/media.id) — nunca um formato adivinhado sem base na doc.
export function parseCommentEvents(payload) {
  const entries = Array.isArray(payload?.entry) ? payload.entry : []
  const eventos = []
  for (const entry of entries) {
    const changes = Array.isArray(entry?.changes) ? entry.changes : []
    for (const c of changes) {
      if (c?.field !== 'comments' || !c.value) continue
      eventos.push({
        tipo: 'comentario',
        remetenteId: c.value.from?.id ? String(c.value.from.id) : null,
        remetenteUsername: c.value.from?.username ? String(c.value.from.username) : null,
        conteudo: typeof c.value.text === 'string' ? c.value.text : null,
        referenciaExterna: c.value.id ? String(c.value.id) : null,
      })
    }
  }
  return eventos
}

// --- Interruptor (UI toggle OFF por padrão) --------------------------------
export async function getAutoReplyEnabled(provider = 'instagram') {
  if (!commandConfigured()) return { enabled: false, source: 'unavailable', reason: 'SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY não configuradas nesta implantação.' }
  try {
    const rows = await readCommand('integration_settings', `?select=auto_reply_enabled&provider=eq.${encodeURIComponent(provider)}&limit=1`)
    return { enabled: Boolean(rows?.[0]?.auto_reply_enabled), source: 'real' }
  } catch (e) {
    // Sem a tabela/migration, o padrão seguro é sempre OFF — nunca presume ligado.
    return { enabled: false, source: 'unavailable', reason: `${MIGRATION_HINT} (${e.message})` }
  }
}

export async function setAutoReplyEnabled({ provider = 'instagram', enabled }) {
  if (!commandConfigured()) {
    const err = new Error('SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY não configuradas nesta implantação.')
    err.status = 503
    throw err
  }
  try {
    await upsertCommand('integration_settings', { provider, auto_reply_enabled: Boolean(enabled) }, 'provider')
  } catch (e) {
    const err = new Error(`${MIGRATION_HINT} (${e.message})`)
    err.status = 503
    throw err
  }
  return { provider, enabled: Boolean(enabled) }
}

// --- Rascunho de resposta por IA (nunca enviado) ---------------------------
// Mesma convenção do Estúdio Kairos (api/_studio_agents.js): OpenRouter fixo,
// nunca selectProvider()/auto, porque o modelo padrão deste repo no
// OpenRouter é genuinamente free-tier — condição para existir sem violar a
// proibição de chamada paga real desta noite.
const REPLY_PROMPT = {
  version: 'v1',
  system: [
    'Você rascunha, em português do Brasil, uma resposta breve (até 2 frases) e cordial para uma mensagem direta ou comentário recebido no Instagram da Kairos Digital.',
    'Nunca prometa preço, prazo ou funcionalidade que não foi informada no próprio texto recebido. Nunca inclua links. Responda só com o texto da resposta, sem comentário nem formatação.',
  ].join('\n'),
}

export async function generateSuggestedReply(conteudo) {
  if (!openrouter.hasCredentials()) {
    const err = new Error('nenhum provider de texto configurado: defina OPENROUTER_API_KEY na Vercel.')
    err.status = 503
    throw err
  }
  const resultado = await openrouter.chat({
    system: REPLY_PROMPT.system,
    messages: [{ role: 'user', content: conteudo }],
    maxTokens: 200,
  })
  return { text: resultado.text, model: resultado.model, promptVersion: REPLY_PROMPT.version }
}

// --- Log append-only ---------------------------------------------------
export async function logWebhookEvent(evento) {
  if (!commandConfigured()) {
    const err = new Error('SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY não configuradas nesta implantação.')
    err.status = 503
    throw err
  }
  try {
    await writeCommand('instagram_webhook_events', {
      tipo: evento.tipo,
      remetente_id: evento.remetenteId,
      remetente_username: evento.remetenteUsername,
      conteudo: evento.conteudo,
      referencia_externa: evento.referenciaExterna,
      resposta_sugerida: evento.respostaSugerida ?? null,
      resposta_prompt_versao: evento.respostaPromptVersao ?? null,
    })
  } catch (e) {
    const err = new Error(`${MIGRATION_HINT} (${e.message})`)
    err.status = 503
    throw err
  }
}

// --- Orquestração de um payload já autenticado (assinatura já verificada) --
// Sempre tenta processar TODOS os eventos do payload mesmo se um falhar —
// devolve um resumo, nunca lança, porque a Meta espera 200 rápido depois que
// a assinatura já provou que a requisição é legítima (falha de log não deve
// virar reentrega em loop do mesmo payload).
export async function handleWebhookPayload(payload) {
  const { enabled: autoReplyEnabled } = await getAutoReplyEnabled('instagram')
  const eventos = [...parseMessagingEvents(payload), ...parseCommentEvents(payload)]

  let logged = 0
  let failed = 0
  for (const evento of eventos) {
    let respostaSugerida = null
    let respostaPromptVersao = null
    if (autoReplyEnabled && evento.conteudo) {
      try {
        const rascunho = await generateSuggestedReply(evento.conteudo)
        respostaSugerida = rascunho.text
        respostaPromptVersao = rascunho.promptVersion
      } catch {
        // Melhor esforço: sem rascunho, o evento ainda é logado sem resposta sugerida.
      }
    }
    try {
      await logWebhookEvent({ ...evento, respostaSugerida, respostaPromptVersao })
      logged += 1
    } catch {
      failed += 1
    }
  }
  return { received: eventos.length, logged, failed, autoReplyEnabled }
}
