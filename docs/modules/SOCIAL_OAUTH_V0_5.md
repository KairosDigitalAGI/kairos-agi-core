# Social OAuth v0.5

## Estado

YouTube e Instagram usam a mesma fronteira de segurança do Painel Operacional e o cofre `command.integracoes_tokens`. O YouTube já possui cliente OAuth configurado em produção, mas ainda não há conexão confirmada. O Instagram está implementado e aguarda as três variáveis Meta.

## Contrato

- `GET /api/integrations/{provider}/connect-url`: exige Basic Auth e devolve a URL oficial de consentimento.
- `GET /api/integrations/{provider}/callback`: valida o `state` HMAC com janela de dez minutos, troca o código e consulta a conta real.
- `GET /api/integrations/{provider}/status`: exige Basic Auth e devolve apenas nome público, escopo e validade.
- `POST /api/integrations/{provider}/disconnect`: exige Basic Auth e remove o vínculo local cifrado.

Os quatro caminhos são implementados por uma função dinâmica, `api/integrations/[provider]/[action].mjs`, para preservar o plano Vercel Hobby. Os adaptadores ficam em `api/_youtube.js` e `api/_instagram.js`; a interface compartilha `useSocialIntegration`.

## Callbacks

- YouTube: `https://kairos-agi-core.vercel.app/api/integrations/youtube/callback`
- Instagram: `https://kairos-agi-core.vercel.app/api/integrations/instagram/callback`

## Configuração Meta

O aplicativo deve usar Instagram API with Instagram Login. Variáveis privadas na Vercel:

- `META_APP_ID`
- `META_APP_SECRET`
- `META_OAUTH_REDIRECT_URI`

Escopos solicitados: `instagram_business_basic` e `instagram_business_content_publish`. A conta deve ser profissional. O callback troca o token curto por token de longa duração e consulta o perfil antes de persistir.

## Limites

Esta fase conecta e identifica a conta. Ela não publica Reels. O envio de mídia exige URL pública do ativo, aprovação server-side, idempotência, consulta do status do container e registro em `content_calendar`. Desconectar remove o token do Kairos, mas não revoga o aplicativo diretamente no provedor.
