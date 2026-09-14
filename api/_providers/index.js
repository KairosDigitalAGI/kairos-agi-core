// Seleção do provider de LLM para o chat de agentes. É AQUI que se troca o cérebro.
//   KAIROS_LLM_PROVIDER=claude | openai | openrouter | auto (padrão)
//   auto = ordem de prioridade decidida pelo Founder (14/09/2026): Anthropic e OpenAI
//   são os planos PAGOS já assinados — usar primeiro. OpenRouter é reserva de último
//   caso, só quando nenhum dos dois pagos está configurado.
import * as claude from './claude.js'
import * as openai from './openai.js'
import * as openrouter from './openrouter.js'

const REGISTRY = { claude, openai, openrouter }
const AUTO_ORDER = [claude, openai, openrouter]

export function selectProvider(name = process.env.KAIROS_LLM_PROVIDER || 'auto') {
  if (name === 'auto') {
    const found = AUTO_ORDER.find((provider) => provider.hasCredentials())
    if (!found) {
      throw new Error(
        'nenhum provider de LLM configurado: defina ANTHROPIC_API_KEY ou OPENAI_API_KEY (planos pagos, prioridade) ' +
        'ou OPENROUTER_API_KEY (reserva) na Vercel',
      )
    }
    return found
  }
  const provider = REGISTRY[name]
  if (!provider) throw new Error(`provider desconhecido: ${name} (válidos: ${Object.keys(REGISTRY).join(', ')}, auto)`)
  return provider
}

export { REGISTRY }
