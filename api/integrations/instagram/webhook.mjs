// Rota estática prevalece sobre a rota dinâmica na Vercel. Ambas compartilham
// a mesma validação de assinatura e o mesmo processador idempotente.
import { handleInstagramWebhook } from '../../_instagramEngagement.js'

export const config = { api: { bodyParser: false } }

export default handleInstagramWebhook
