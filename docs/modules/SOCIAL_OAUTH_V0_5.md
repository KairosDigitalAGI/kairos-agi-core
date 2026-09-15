# Social OAuth v0.5

## Estado

YouTube e Instagram usam a mesma fronteira de segurança do Painel Operacional e o cofre `command.integracoes_tokens`. O YouTube já possui cliente OAuth configurado em produção, mas ainda não há conexão confirmada. O Instagram está implementado e aguarda as três variáveis Meta.

## Contrato

- `GET /api/integrations/{provider}/connect-url`: exige Basic Auth e devolve a URL oficial de consentimento.
- `GET /api/integrations/youtube/auth-check`: valida a credencial operacional antes de marcar a sessão local como desbloqueada.
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

## Publicação de Reels

Missão 006, Fase 12: `postToInstagram({jobId, caption})` em `api/_content.js` publica de verdade um job em `etapa="video"` já aprovado, usando o `content_assets.storage_path` público do vídeo (não faz upload binário — a Content Publishing API da Meta exige URL, diferente do YouTube). As chamadas HTTP ficam em `api/_instagram.js` (`getValidInstagramAccess`, `createReelsContainer`, `checkContainerStatus`, `publishReelsContainer`). Fluxo assíncrono de três passos: cria o container → faz polling do `status_code` (orçamento curto, configurável por `INSTAGRAM_POLL_INTERVAL_MS`/`INSTAGRAM_POLL_MAX_TENTATIVAS`) → publica quando `FINISHED`. O `creation_id` é gravado em `command.content_calendar` (`status:"agendado"`) antes de esperar, para retomar do mesmo container em vez de duplicar o Reels se a function for encerrada no meio do polling; se o orçamento de espera esgotar antes do Instagram terminar, devolve `status:"processando"` sem erro — o Founder clica de novo em instantes. Ver `docs/context/CHANGELOG.md` (Fase 12) para o detalhamento completo.

## Limites

Desconectar remove o token do Kairos, mas não revoga o aplicativo diretamente no provedor.
