# Integration Control Plane

O Centro de Integrações expõe somente o estado real da configuração no servidor. A rota `status` de `api/integrations/[...route].mjs` (lógica em `api/_integrations.js`; era o arquivo próprio `api/integrations/status.mjs` até a consolidação da Fase 15, 23/09/2026) verifica a presença das variáveis necessárias e nunca retorna seus valores. O frontend não presume conexão com base em uma sessão aberta no navegador.

Instagram e YouTube usam OAuth de aplicação web. Tokens são persistidos no Supabase apenas pelo backend, cifrados na aplicação e protegidos por RLS sem policy pública. O YouTube está conectado ao canal real Kairos Digital; o Instagram continua pendente até configurar o app Meta e concluir o consentimento da conta profissional.

O X permanece em modo manual de custo zero porque sua API é paga por uso. A etapa futura exportará vídeo, texto e link, abrirá o compositor e exigirá confirmação do Founder antes da publicação.

## Variáveis de servidor

- Meta: `META_APP_ID`, `META_APP_SECRET`, `META_OAUTH_REDIRECT_URI`.
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
