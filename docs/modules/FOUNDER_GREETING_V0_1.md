# Teste de saudação do Founder no Instagram

Pedido de 18/09/2026: quando Matheus Schelle enviar exatamente “oi” para @_kairosdigital_ por Direct ou comentário, KAIROS deve responder com uma saudação curta criada por LLM. O código foi implementado; a ativação real depende das verificações abaixo e não deve ser inferida dos testes locais.

## Condições de envio

- Webhook oficial assinado por `X-Hub-Signature-256`, `object=instagram`, evento textual novo da conta OAuth conectada. Ecos e IDs de outras contas não passam.
- O ID numérico do remetente deve coincidir exatamente com `KAIROS_IG_FOUNDER_TEST_SENDER_ID`, preenchido somente após um evento real do próprio Founder. Nome de exibição e username não autenticam a identidade.
- Somente `oi` com pontuação/espaços opcionais; Direct dentro da janela de 24 horas. Não há conversa livre, resposta a clientes ou publicação de conteúdo por este teste.
- `KAIROS_IG_FREE_LLM_ENABLED=true`, `KAIROS_GEMINI_FREE_TIER_CONFIRMED=true` e `KAIROS_GEMINI_FREE_API_KEY` devem existir no servidor. A chave deve ser de um projeto Google AI Studio verificado como **Free Tier sem faturamento vinculado**; não reutilizar `GOOGLE_AI_KEY` sem essa verificação. O modelo é `gemini-2.5-flash-lite`, com entrada fixa sem ID, nome ou conteúdo privado do remetente.
- Falha da LLM vira `review`, sem mensagem inventada. Uma resposta por pessoa/canal/dia; o envio usa o estado `pending → sending → sent` e não repete falhas ambíguas.

## Verificação pendente

1. Confirmar a migration `0025_instagram_engagement.sql` no projeto Supabase mestre correto.
2. Confirmar assinatura de `comments` e `messages` na conta via `GET /api/integrations/instagram/webhook-subscription` (Basic Auth). Assinatura do app no dashboard Meta não basta.
3. Confirmar política de privacidade, acesso ao vivo e entrega de webhooks no app Meta correto (`1572077540519784`).
4. Receber um Direct e um comentário de teste do Founder, registrar os IDs no banco e identificar o `sender_id` do próprio perfil. Só então configurar o ID no servidor.
5. Verificar projeto/chave Gemini no Free Tier e fazer uma geração controlada. Sem confirmação de custo zero, deixar as três flags ausentes.
6. Repetir “oi” nos dois canais e conferir `remote_reply_id`, `sent_at` e a resposta visível no Instagram. Testes unitários não substituem essa prova.

Fontes oficiais: [preços Gemini](https://ai.google.dev/gemini-api/docs/pricing), [faturamento e Free Tier](https://ai.google.dev/gemini-api/docs/billing), [chaves por projeto](https://ai.google.dev/gemini-api/docs/api-key).
