// Resposta curta para o teste do Founder. A chave deve pertencer a um projeto
// Gemini API confirmado no Free Tier, sem conta de faturamento vinculada.
const MODEL = 'gemini-2.5-flash-lite'

export function freeGreetingConfigured() {
  return process.env.KAIROS_IG_FREE_LLM_ENABLED === 'true' &&
    process.env.KAIROS_GEMINI_FREE_TIER_CONFIRMED === 'true' &&
    Boolean(process.env.KAIROS_GEMINI_FREE_API_KEY)
}

export async function generateFounderGreeting(kind) {
  if (!freeGreetingConfigured()) throw new Error('LLM gratuita do Instagram não configurada em projeto Free Tier verificado.')
  if (!['comment', 'message'].includes(kind)) throw new Error('Canal inválido para saudação.')
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.KAIROS_GEMINI_FREE_API_KEY },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: 'Você é KAIROS, assistente da Kairos Digital. Responda em português brasileiro a um cumprimento simples de teste vindo do Founder. Seja cordial, breve e natural. Uma ou duas frases. Não invente serviços, preços, métricas, prazos ou ações realizadas. Não inclua links, dados pessoais, hashtags nem promessas.' }] },
      contents: [{ role: 'user', parts: [{ text: kind === 'comment' ? 'Responda ao comentário: oi' : 'Responda ao Direct: oi' }] }],
      generationConfig: { temperature: 0.6, maxOutputTokens: 100 },
    }),
    signal: AbortSignal.timeout(8000),
  })
  if (!response.ok) throw new Error(`Gemini Free Tier indisponível (${response.status}).`)
  const body = await response.json()
  const reply = String(body.candidates?.[0]?.content?.parts?.map(part => part.text || '').join(' ') || '').trim()
  if (!reply || reply.length > 500 || /https?:\/\/|www\./i.test(reply)) throw new Error('Resposta da LLM inválida para envio.')
  return reply
}
