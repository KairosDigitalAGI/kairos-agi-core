# Integration Control Plane

O Centro de Integrações expõe somente o estado real da configuração no servidor. A função `api/integrations/status.mjs` verifica a presença das variáveis necessárias e nunca retorna seus valores. O frontend não presume conexão com base em uma sessão aberta no navegador.

Instagram e YouTube usam OAuth de aplicação web. Tokens são persistidos no Supabase apenas pelo backend, cifrados na aplicação e protegidos por RLS sem policy pública. O YouTube está conectado ao canal real Kairos Digital e o Instagram à conta `_kairosdigital_`, confirmados pelo status autenticado em 17/09/2026. O atendimento por webhook é uma etapa distinta, ainda pendente de ativação externa; ver [Atendimento Instagram](INSTAGRAM_ENGAGEMENT.md).

O X permanece em modo manual de custo zero porque sua API é paga por uso. A etapa futura exportará vídeo, texto e link, abrirá o compositor e exigirá confirmação do Founder antes da publicação.

## Variáveis de servidor

- Meta: `META_APP_ID`, `META_APP_SECRET`, `META_OAUTH_REDIRECT_URI`; para o webhook, também `META_WEBHOOK_VERIFY_TOKEN`.
- Google: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_OAUTH_REDIRECT_URI`.
- Token store: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `KAIROS_TOKEN_ENCRYPTION_KEY`.

Os nomes ficam em `.env.example`; os valores reais entram somente nas variáveis de ambiente da Vercel. Senhas pessoais nunca são solicitadas pela aplicação ou salvas no repositório.

## Sequência de lançamento em sete dias

1. Identidades, credenciais OAuth e armazenamento seguro.
2. Fila de publicação e aprovação autenticada.
3. Instagram e YouTube em ambiente de teste.
4. Produção diária de vídeos curtos.
5. Métricas reais e aprendizado editorial.
6. QA, limites, retries e recuperação de falhas.
7. Primeira rotina operacional acompanhada pelo Founder.
