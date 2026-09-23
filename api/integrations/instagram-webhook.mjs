// Webhook do Instagram (DM + comentários) — Missão 006, Fase 17, item 4 do
// backlog noturno. Arquivo FÍSICO PRÓPRIO, não consolidado no catch-all
// api/integrations/[...route].mjs de propósito: a verificação de assinatura
// (X-Hub-Signature-256) da Meta exige o corpo BRUTO da requisição, e os
// helpers automáticos da Vercel para o handler Node (request,response) já
// entregam req.body reserializado/parseado (sem garantia de bytes idênticos
// ao que a Meta assinou) — não há como desligar esse parsing por arquivo
// (só via env var NODEJS_HELPERS=0 do projeto inteiro, o que quebraria
// req.body/req.query de todas as outras rotas). O formato Web Standard
// `fetch(request)` não tem esse parsing automático: request.text() devolve
// os bytes exatos, resolvendo a verificação corretamente sem tocar no resto
// do Core. Custa 1 slot novo do teto de 12 (tínhamos 9 livres da Fase 15).
//
// Sem Basic Auth de propósito: é a Meta quem chama esta URL, não o Founder
// logado no painel — a autenticidade vem da assinatura, não de credencial.
import { verifyWebhookChallenge, verifyWebhookSignature, handleWebhookPayload } from '../_instagram_webhook.js'

export default {
  async fetch(request) {
    const url = new URL(request.url)

    if (request.method === 'GET') {
      try {
        const challenge = verifyWebhookChallenge({
          mode: url.searchParams.get('hub.mode'),
          token: url.searchParams.get('hub.verify_token'),
          challenge: url.searchParams.get('hub.challenge'),
        })
        return new Response(challenge, { status: 200, headers: { 'content-type': 'text/plain' } })
      } catch (e) {
        return new Response(e.message, { status: e.status || 403 })
      }
    }

    if (request.method === 'POST') {
      const rawBody = await request.text()
      try {
        verifyWebhookSignature(rawBody, request.headers.get('x-hub-signature-256'))
      } catch (e) {
        return Response.json({ erro: e.message }, { status: e.status || 401 })
      }
      let payload
      try {
        payload = JSON.parse(rawBody)
      } catch {
        return Response.json({ erro: 'corpo não é JSON válido' }, { status: 400 })
      }
      const resultado = await handleWebhookPayload(payload)
      return Response.json({ ok: true, ...resultado }, { status: 200 })
    }

    return new Response('method not allowed', { status: 405 })
  },
}
