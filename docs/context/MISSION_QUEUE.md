# Fila de missões — Memory Sync V1.1

Verificação de 18/09/2026: deploy e galeria confirmados; migration 0025 inferida pela regra persistida retornada pela inbox de produção; `subscribed_apps` confirma os dois campos na conta. Próximo bloqueio externo: cadastrar a política de privacidade no app Meta, concluir análise/publicação e receber um evento real de Matheus Schelle para obter o ID. Depois vincular chave de projeto Gemini Free Tier sem faturamento, ativar a saudação e provar Direct + comentário por `remote_reply_id` e resposta visível. Até lá, não declarar automação ao vivo.

Atualização 18/09/2026, mídia: três imagens, duas cenas de 8 s e uma montagem de 16 s reais no Flow; importação local MP4/WebM implementada. Próximo: disponibilizar no deploy, confirmar galeria em produção, ampliar montagem se houver cota gratuita legítima e preparar pacote editorial para postagem futura. A geração diária por Flow ainda requer operação supervisionada; não há API gratuita de vídeo.

Atualização 18/09/2026, atendimento: saudação “oi” do Founder por LLM gratuita implementada para remetente identificado por ID, mas **desligada** até chave Free Tier sem faturamento, ID do Founder obtido por evento real, assinatura da conta, migration e app Meta apto a entregar webhooks. Ver `docs/modules/FOUNDER_GREETING_V0_1.md`. Nenhuma DM/comentário foi comprovadamente respondido automaticamente.

Atualização 18/09/2026: proteção do webhook e do orçamento aplicada. A entrega efetiva de comentários/DMs da Meta, publicação do app e teste com a conta real continuam por verificar; código implantado não equivale a evento recebido.

Atualização 23/09/2026, Seedance: adaptador da Vercel AI Gateway pronto e desligado. Próximo passo de mídia: aplicar migrations 0020 e 0022 no Supabase mestre; depois registrar/aprovar um job textual de establishing shot, ativar apenas `KAIROS_ENABLE_SEEDANCE_GATEWAY=true` para uma chamada e verificar o `usage`. Não usar press kit, compra ou recarga nesta primeira geração.

| Missão | Estado | Escopo |
| --- | --- | --- |
| 001 | Fundação entregue; fontes externas pendentes | Dashboard, World e módulos iniciais; exemplos retirados |
| 002 | Editorial local entregue | Instagram, prompts, aprovação; Graph API desconectada |
| 003 | Implementada | Clone Engine arquitetural, catálogo local e pipeline; sem clonagem ou geração |
| 004 | Implementada e corrigida | Geração motion do zero por roteiro e pós-produção local; render e download WebM |
| 004.1 | Implementada | Control Plane de integrações e plano operacional de sete dias; credenciais ainda pendentes |
| 005 | Planejada | KAIROS WhatsApp; preservar operação existente e validar conexão separada |
| 006 | Fase 14 entregue; atendimento Instagram em ativação (17/09/2026) | YouTube e Instagram reais conectados. Mapa do Projeto (migration 0023 pendente); webhook publicado e verificado, `comments`/`messages` assinados, inbox e regras implementados (migration 0025 pendente). Faltam política de privacidade, análise/publicação Meta e teste ponta a ponta. |
| 007 | Planejada | Billing Center; sem cobrança ou upgrade automático autorizado |
| 008 | Planejada | Money Hunter Intelligence Center e Ideas Vault |
| 009 | Planejada | Founder Mobile App |
| 010 | Planejada | World 0.2, incluindo Money Hunter |

A numeração 003–008 anterior foi substituída por esta fila em 11/09/2026. Missão 004 foi autorizada posteriormente. O YouTube tornou-se a primeira integração externa real conectada em 15/09/2026; publicação continua privada por padrão e exige aprovação do Founder.

Correção autorizada após Missão 003: organograma completo importado e exposto no painel/World. A Missão 004 foi ampliada após validação do Founder: criação do zero é o fluxo principal; edição virou pós-produção. Nenhum serviço externo foi ativado.

Missão 006 — Fase 1 (14/09/2026): consolidação autorizada pelo Founder ("usar o que já tem, e se não tiver, criar") para reunir kairos-command, kairos-os e kairos-agi-core em um único braço operacional. Esta fase liga o Dashboard a dado real já existente no Supabase mestre (schema `command`, dono: kairos-command) sem duplicar base nem tocar RLS/migrations de origem: `api/business-metrics.mjs` (receita do mês, receita total, MRR, clientes ativos/total) e `api/agent-status.mjs` (frota `command.agents` + últimos alertas críticos de `command.events`) leem via PostgREST server-side com `SUPABASE_SERVICE_ROLE_KEY`, atrás de Basic Auth própria (`KAIROS_USER`/`KAIROS_PASS` deste projeto, distinta da do kairos-os). Nunca chama pm2; apenas lê o snapshot que o sidecar do kairos-command já escreve. Pendente: provisionar `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`/`KAIROS_PASS` de produção na Vercel (bloqueado pelo classificador de permissões deste ambiente para escrita de segredo via CLI — o Founder precisa rodar os três `vercel env add` reportados no chat).

Missão 006 — Fase 2 (14/09/2026): chat consultivo com qualquer agente do organograma (27 papéis), reaproveitando a arquitetura de provider trocável do kairos-os (`agents/ceo/providers`), reimplementada zero-dependência em `api/_providers/{claude,openai,openrouter}.js` + seletor `api/_providers/index.js`. Ordem de prioridade `auto` (decisão do Founder): Anthropic (planos pagos) → OpenAI (planos pagos) → OpenRouter (reserva de último caso, nunca default). Handler `api/_agent-chat.js` monta o system prompt com a identidade real do agente (`data/agentRegistry.json`) e os números reais de `api/_business.js` (mesmo cálculo de receita/MRR/clientes/frota da Fase 1, agora fatorado para não duplicar); deixa explícito que nenhum agente tem executor conectado — o chat é só conversa, nunca finge ter agido. Mesma Basic Auth do Painel Operacional. UI: botão "Conversar" em cada card de `AgentsPage`, abre `AgentChatPanel`. 6 testes novos (`tests/agent-chat.test.mjs`) cobrindo prioridade de provider, fail-closed sem credencial e não-fabricação de número quando o schema `command` está indisponível — total 36/36 passando.

Missão 006 — Fase 3 (14/09/2026): schema e primeira fatia do Content Engine. Migration `kairos-command/supabase/migrations/0020_content_engine.sql` (redigida, **ainda não aplicada em produção** — o Founder precisa colar no SQL Editor do Supabase, mesmo padrão de outras migrations pendentes desta conta) desenha `command.content_jobs`, `command.content_assets`, `command.content_calendar`, `command.avatars`, `command.prompt_library`: idempotente, colunas `criado_em`/`atualizado_em` com `touch_atualizado_em()`, RLS via `command.is_operador()` só para SELECT (escrita fica exclusivamente service_role, sem policy de insert/update/delete). Neste Core: `api/_content.js` (leitura do pipeline + criação de job) e rota `api/content-jobs.mjs` (GET lista jobs reais, POST registra uma ideia nova em etapa=ideia), ambas atrás da mesma Basic Auth; sem a migration aplicada, GET reporta `unavailable` citando o arquivo pendente e POST falha fechado com 503 — nunca finge ter criado um job. UI: `ContentEnginePanel` no Dashboard (formulário "Registrar ideia" + lista do pipeline por etapa). 4 testes novos (`tests/content-engine.test.mjs`) cobrindo unavailable sem credencial, o hint de migration pendente na leitura e na escrita — total 40/40 passando. Fora de escopo desta fase: motor de geração (roteiro/imagem/vídeo/legenda) e fila Hunter Skill, ainda planejados.

Missão 006 — investigação Hunter Skill encerrada (14/09/2026, sem mudança neste Core): auditoria confirmou que não existe "3 implementações divergentes" para consolidar — framing de sessão anterior estava desatualizado. O Hunter que atende a Sofia já é feature madura e funcionando ponta a ponta em `kairos-command` (painel) + VPS da Sofia (motor de coleta + ponte HTTP `/hunter/status`/`/hunter/cacar`, já aplicada em produção e confirmada ao vivo por `curl` público). `kairos-hunter-skill` é template genérico não usado por nenhum cliente ativo; `kairos-leadgen` é produto diferente (funil B2B frio por e-mail). Único trabalho necessário foi corrigir comentários/copy desatualizados em `kairos-command` (`src/lib/sofia/hunter.ts`, `src/components/cliente/CacarLeads.tsx`) que ainda descreviam a ponte HTTP como ausente — commit `834cc7d` nesse repo. Nenhuma fila de "Hunter Skill" pendente neste Core.

Missão 006 — Fase 4 (14/09/2026): OAuth do YouTube, a primeira integração de publicação ativada de verdade (Instagram/TikTok continuam esperando aprovação da Meta). Migration `kairos-command/supabase/migrations/0021_integracoes_tokens.sql` (redigida, **ainda não aplicada em produção**) desenha `command.integracoes_tokens`: uma linha por provedor da própria Kairos Digital, `access_token`/`refresh_token` sempre cifrados (AES-256-GCM) antes de chegar ao banco, RLS habilitado SEM nenhuma policy — nem o operador logado no painel lê essa tabela, só `service_role`. Neste Core: `api/_crypto.js` (cifra dos tokens + assinatura HMAC do `state` do OAuth, chave `KAIROS_TOKEN_ENCRYPTION_KEY`), `api/_youtube.js` (monta a URL de consentimento do Google, troca o código por tokens, confirma o canal via YouTube Data API, grava cifrado), quatro rotas em `api/integrations/youtube/` (`connect-url` e `status`/`disconnect` atrás da Basic Auth do Painel Operacional; `callback` sem essa guarda — o Google não consegue mandar o header — validado pelo `state` assinado com janela de 10 min). Botão "Conectar canal"/"Desconectar" adicionado à `IntegrationsPage`. Sem a migration aplicada ou sem `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`/`GOOGLE_OAUTH_REDIRECT_URI` configurados, tudo falha fechado citando o motivo exato — nunca finge conexão. 12 testes novos (`tests/youtube-integration.test.mjs`) cobrindo cifra/decifra, assinatura e expiração do `state`, fail-closed sem credencial do Google e sem migration — total 50/50 passando. Ativação real depende do Founder criar o OAuth Client Web no Google Cloud Console (criação de conta/credencial não é automatizada por este agente).

Missão 006 — correção pós-Fase 5, mesmo dia (14/09/2026): auto-revisão encontrou uma lacuna real na regra inviolável "nunca ativar geração paga sem aprovação explícita". A migration `0020_content_engine.sql` já desenha essa trava no schema — comentário em `command.content_assets.gratuito`: "Geração paga só existe quando o job carrega aprovado:true explícito do Founder" —, distinta do gate de etapa `aprovacao` (esse é só pré-*publicação*, documentado como tal no comentário da própria tabela `content_jobs`). O `generateScript` da Fase 5, como entregue, chamava o provider pago só checando `etapa === 'ideia'`, sem checar `content_jobs.aprovado` — ou seja, o clique "Gerar roteiro" sozinho já bastava para gastar, o que não respeita o desenho do schema nem a regra inviolável. Corrigido no mesmo dia: `generateScript` agora recusa com 402 quando `job.aprovado !== true`; nova função `approveContentJob` (rota `api/content-jobs/approve.mjs`) grava `aprovado:true/aprovado_por/aprovado_em` como ação explícita e separada do clique de gerar. UI: botão "Aprovar geração paga" aparece primeiro; "Gerar roteiro" só aparece depois de aprovado. 6 testes novos cobrindo o gate 402 e `approveContentJob` — total 60/60 passando.

Missão 006 — Fase 6 (14/09/2026): geração real de imagem de capa (etapa roteiro→imagem) para o Content Engine. Só a OpenAI gera imagem entre os providers deste Core (Claude/Anthropic não tem esse recurso) — `api/_providers/openai.js` ganhou `generateImage({prompt})` (Images API, modelo `gpt-image-1`, sem fallback de provider). Migration nova `kairos-command/supabase/migrations/0022_content_assets_bucket.sql` (redigida, **ainda não aplicada em produção**) cria o bucket público `content-assets` no Supabase Storage (mesmo padrão do bucket `videos` já usado pelo kairos-command) — `command.content_assets.storage_path` já previa isso desde a migration 0020, mas nenhum bucket existia até agora. `api/_storage.js` (novo, zero dependência, mesmo espírito de `_command.js`) sobe o binário via REST puro e monta o path seguro. `generateImage()` em `api/_content.js` segue a mesma cascata de falha fechada de `generateScript` (400/503/404/409), reaproveita o MESMO gate de aprovação de gasto da correção anterior (402 sem `aprovado:true` — a aprovação é por job, cobre todas as etapas pagas, não por etapa), e falha fechado citando `OPENAI_API_KEY` especificamente quando ausente (nunca tenta outro provider para imagem). Rota `api/content-jobs/generate-image.mjs`, mesma Basic Auth; botão "Gerar imagem" no `ContentEnginePanel` para jobs em etapa=roteiro. 7 testes novos (`tests/content-engine.test.mjs`) cobrindo toda a cascata de falha e um caminho de sucesso completo (mock de Images API + upload de Storage + escrita em content_assets + avanço de etapa) — total 67/67 passando.

Missão 006 — Fase 7 (14/09/2026): geração real de vídeo (etapa imagem→video), motor free-tier primeiro. `api/_providers/veo.js` (Google Veo via AI Studio, `GOOGLE_AI_KEY`, `generateVideo` assíncrono com polling de operação) e `api/_providers/fal.js` (fal.ai, fila `queue.fal.run`, `FAL_KEY`) são novos. `generateVideo({jobId, tier})` em `api/_content.js`: `tier="free"` tenta Veo primeiro; se Veo devolver 429 (quota esgotada) ou não estiver configurado, cai para Kling v1.6 (fal.ai) — mas esse fallback não é gratuito de verdade (fal.ai cobra por segundo de vídeo gerado), então continua exigindo `content_jobs.aprovado === true` como qualquer outra geração paga, mesmo rotulado "free" no pedido original do Founder (desvio deliberado da literalidade do pedido, documentado em comentário e em teste). `tier="paid"` usa Kling v2.1 Master, sempre exige aprovado. Diferente da imagem, a URL do provider é gravada direto em `content_assets.storage_path` sem subir para o bucket próprio (evita baixar/re-subir binário grande duas vezes; tradeoff documentado: a URL pode ser temporária). Rota `api/content-jobs/generate-video.mjs`, mesma Basic Auth; botões "Gerar vídeo (grátis)"/"(premium)" no `ContentEnginePanel`. 13 testes novos, total 79/79 passando.

Missão 006 — Fase 8 (14/09/2026): publicação real no YouTube (etapa video→publicado), fechando o pipeline ponta a ponta pela primeira vez. `api/_youtube.js` ganhou `getValidAccessToken()` (decifra o token cifrado da Fase 4, renova via `refresh_token` quando vencido ou a 60s de vencer, persiste só os campos atualizados) e `uploadVideo()` (upload multipart/related construído à mão, zero SDK, sobe o vídeo como `privacyStatus:"private"` por padrão — visibilidade pública fica sempre a critério manual do Founder). `postToYoutube({jobId})` em `api/_content.js` baixa o vídeo do `content_assets.storage_path`, sobe pro YouTube e grava `content_calendar` (`canal:"youtube"`, `status:"publicado"`, `referencia_externa` = ID do vídeo). **Desvio deliberado do plano original documentado em código e aqui**: a migration 0020 desenhou `etapa="aprovacao"` como o gate exclusivo de pré-publicação ("nada publica antes disso"), mas as etapas legenda/aprovacao ainda não têm motor construído — em vez de deixar a Fase 8 travada esperando as próximas fases, `postToYoutube` reaproveita o mesmo `content_jobs.aprovado` (já em uso como gate de gasto desde a correção pós-Fase 5) também como o sinal explícito de "pode publicar" do Founder, a revisitar quando legenda/aprovacao ganharem motor de verdade. Se o upload for bem-sucedido mas a escrita local falhar depois, o erro cita o `videoId` real para reconciliação manual — nunca tenta reenviar sozinho (evitaria duplicar vídeo no canal ao vivo). Rota `api/content-jobs/post-youtube.mjs`, mesma Basic Auth; botão "Postar no YouTube" para jobs em etapa=video e aprovado. 9 testes novos, total 94/94 passando. Ativação real segue bloqueada pelas mesmas pendências da Fase 4 (migrations 0020/0021 aplicadas + OAuth Client do Google) mais duas novas: `GOOGLE_AI_KEY` (Veo) e `FAL_KEY` (Kling).

Missão 006 — correção pós-Fase 8 (14/09/2026, mesmo dia): Founder aplicou as 3 migrations pendentes (0020/0021/0022) e configurou os 10 env vars de produção (Supabase, Google OAuth, GOOGLE_AI_KEY, FAL_KEY, KAIROS_USER/PASS/TOKEN_ENCRYPTION_KEY) — verificado via `vercel env ls production` e via REST direto contra o Supabase (5/5 recursos das migrations respondendo 200). Redeploy feito para o runtime pegar todos os env vars novos; `/api/integrations/status` confirmado ao vivo com `tokenStoreConfigured:true` e `youtube.oauthConfigured:true`. Um brief da missão seguinte trouxe 3 "correções" que a inspeção do código real (já em produção, não hipotético) mostrou serem premissas falsas: (1) o botão de conectar YouTube exigir unlock do Painel Operacional não é um bug de UI — é Basic Auth server-side deliberada e documentada, compartilhada com as rotas de receita (`checkAuth` em `api/_auth.js`), removê-la do lado cliente não mudaria nada (o servidor ainda recusaria) e removê-la do servidor seria abrir uma rota de OAuth real sem autenticação; (2) o contador "OAuth pronto: 1/2" já está correto — o denominador conta 2 PROVEDORES oauth (YouTube + Instagram), não as 2 credenciais do YouTube, e Instagram legitimamente não está configurado (aprovação da Meta pendente, fato antigo do projeto) — forçar "2/2" fabricaria dado de prontidão, violando a própria red line do Founder; (3) a rota de callback do YouTube já existe e está implementada desde a Fase 4. Nenhuma das três foi alterada; reportado ao Founder em vez de aplicado às cegas.

Missão 006 — Fase 9 (14/09/2026): Avatar Studio. Schema real de `command.avatars` (migration 0020) só tem `agente_slug`/`nivel`/`xp`/`coins`/`conquistas` — nenhuma coluna de identidade (nome/role/personality/story/image_url) existe na tabela, por desenho: o comentário da própria migration diz que identidade vive em `src/data/agentRegistry.json` deste repo, casada por `agente_slug`=id do registro, texto puro, não FK. `api/_avatars.js#listAvatars` faz esse join no servidor: os 27 agentes do registro sempre aparecem no grid, com baseline `nivel:1/xp:0/coins:0/hasProgress:false` para quem ainda não tem linha no Supabase — nunca um número fabricado. `ensureAvatar({agenteSlug})` só cria/garante a linha de progresso de um agente JÁ existente no registro (404 para slug desconhecido) — nunca insere uma identidade nova, o que colidiria com identidades já existentes (o brief original propunha um "ORION" com role "Estrategista", mas ORION já é CEO no registro real). Rota consolidada `api/avatars/[action].mjs` (`list`/`upsert`), mesmo padrão `[action].mjs` das Fases 7/8 para não estourar o teto de 12 Serverless Functions do Hobby. UI nova: `AvatarStudioPage` (grid de cards com nível/XP/coins/conquistas + botão "Registrar progresso inicial" para agentes sem linha), entrada no sidebar. 6 testes novos (`tests/avatars.test.mjs`).

Missão 006 — Fase 10 (14/09/2026): Story Engine (gamificação). `api/_story.js#generateDailyNarrative` nunca aceita métrica vinda do cliente (testado explicitamente: um valor fabricado enviado no payload é ignorado) — recalcula receita/MRR/clientes reais via `_business.js` e conta jobs reais de `content_jobs`, só então pede a um provider pago (mesma prioridade Anthropic→OpenAI→OpenRouter) para narrar esses números em primeira pessoa, tom Matrix/vigilância. `getAgentActivity` lê os `content_jobs` mais recentes e rotula cada um com o departamento do organograma dono daquela etapa via um mapa fixo (`roteiro`→Social AI, `imagem`→Clone AI, `video`→Video AI, `publicado`→YouTube AI, etc.) — é um rótulo organizacional (qual área é dona daquela etapa do pipeline), nunca uma alegação de que aquele agente específico executou o job, mesma honestidade do chat da Fase 2 (nenhum agente tem executor conectado). Rota consolidada `api/story/[action].mjs` (`narrative`/`activity`) — com ela, o Core chega a exatamente 12 rotas, o teto do plano Hobby, sem margem para a próxima fase sem nova consolidação ou desativação de rota. Nova seção "Operações ativas" no Dashboard (`OperationsFeed.tsx`) com o feed real + botão "Narrar o dia". Desvios deliberados do brief original: sem `/api/generate-script.ts` (rotas deste repo são `.mjs` sob `api/`, lógica em `api/_*.js` — convenção de todas as fases anteriores) e sem `content_jobs.approved` (a coluna real, confirmada na migration 0020, é `aprovado`). 5 testes novos, total 105/105 passando.

Missão 006 — Fase 11 (15/09/2026): Instagram OAuth implementado com os escopos profissionais mínimos, token longo cifrado e validação do perfil antes de gravar em `command.integracoes_tokens`. O hook de interface agora serve YouTube e Instagram. As quatro rotas físicas do YouTube foram substituídas por `api/integrations/[provider]/[action].mjs`, preservando todas as URLs e reduzindo o total público de 12 para 9 funções no plano Hobby. YouTube continua configurado, mas conexão real depende de concluir o consentimento; Instagram depende de `META_APP_ID`, `META_APP_SECRET`, `META_OAUTH_REDIRECT_URI` e consentimento. 110 testes, typecheck e build passam.

Missão 006 — Fase 12 (15/09/2026): publicação real de Reels no Instagram (`etapa video→publicado`), fechando a lacuna que a própria Fase 11 documentou ("Ela não publica Reels") em `docs/modules/SOCIAL_OAUTH_V0_5.md`. `api/_instagram.js` ganhou `getValidInstagramAccess()` (decifra o token de longa duração salvo na Fase 11; diferente do YouTube, o Instagram não tem `refresh_token` separado — o próprio access_token se renova contra si mesmo via `grant_type=ig_refresh_token`, com 1 dia de folga antes do vencimento; sem token salvo ou vencido demais pra renovar, falha fechado com 404/401 pedindo reconexão), `createReelsContainer()`, `checkContainerStatus()` e `publishReelsContainer()` — as três chamadas HTTP puras do fluxo assíncrono de Content Publishing API da Meta. `postToInstagram({jobId, caption})` em `api/_content.js` orquestra: mesmo gate de `postToYoutube` (etapa=video 409, aprovado 402), busca o `content_assets.storage_path` já público (o Instagram exige URL pública do vídeo, diferente do upload binário direto do YouTube), grava o `creation_id` em `content_calendar` (`status:"agendado"` — único valor do enum real que serve pra "ainda não publicado", confirmado direto na migration 0020; não existe `'processando'` no schema) **antes** de esperar o processamento, faz polling com orçamento curto e configurável (`INSTAGRAM_POLL_INTERVAL_MS`/`INSTAGRAM_POLL_MAX_TENTATIVAS`, mesma convenção de `api/_providers/fal.js`, padrão ~24s) e devolve `status:"processando"` sem erro se o Instagram ainda não terminou — o Founder clica de novo em instantes e a próxima chamada retoma do mesmo container em vez de criar um segundo (idempotência por leitura-antes-de-escrever, já que a tabela não tem constraint único em `asset_id`+`canal`). Job já publicado é short-circuit puro (nunca chama a Meta de novo). Nenhuma rota nova: a ação `post-instagram` foi somada ao `api/content-jobs/[action].mjs` já existente, mantendo o total em 9/12 funções. `useContentPipeline` ganhou `postToInstagram()`; botão "Postar no Instagram" no `ContentEnginePanel` ao lado do do YouTube. 10 testes novos (`tests/instagram-reels.test.mjs`: 400/503/404/409/402/409-sem-asset, short-circuit já publicado, retomada de container existente, sucesso completo e o caminho "processando"), total 122/122 passando; typecheck e build limpos. Segue bloqueado pra ativação real pelas mesmas pendências da Fase 11 (`META_APP_ID`/`META_APP_SECRET`/`META_OAUTH_REDIRECT_URI` e consentimento do Founder).

Missão 006 — Fase 13 (15/09/2026): link direto para a conta conectada, a pedido explícito do Founder ("quero poder ver e clicar ali, pra entrar dentro do canal que tá"). `api/_youtube.js#computeYoutubeStatus` passou a selecionar também `account_id` (ID real e estável do canal, já gravado desde a Fase 4 em `completeConnection`) e devolve `profileUrl: https://www.youtube.com/channel/{account_id}` — nenhuma chamada nova à API do Google, é só montar a URL com um dado que já estava salvo. `api/_instagram.js#computeInstagramStatus` deriva um `username` de `account_label` só quando ele já começa com `@` (formato gravado pela Fase 11 quando a Graph API devolve `username` no connect); nesse caso monta `profileUrl: https://www.instagram.com/{username}/`, senão devolve `profileUrl: null` — nunca monta um link a partir de um nome de exibição que não é garantidamente um handle de URL válido (regra "nunca inventar dado" aplicada aqui a um link, não só a uma métrica). `src/types/integration.ts#SocialConnectionStatus` ganhou `profileUrl: string | null` na variante conectada; a rota `api/integrations/[provider]/[action].mjs` não mudou (a ação `status` é pass-through puro do adapter, o campo novo já chega ao frontend sem tocar na camada de rota). `IntegrationsPage.tsx` mostra o botão "Ver conta conectada" (abre em nova aba) quando `profileUrl` existe, e uma frase explicando a ausência quando não existe — nunca esconde silenciosamente. X (Twitter) fica de fora desta fase: hoje não existe OAuth nem `integracoes_tokens` para X no Core (`api/integrations/status.mjs` trata X como `mode:'manual-free'`, sem conta armazenada), então não há "conta conectada" real pra linkar ainda — gap registrado, não resolvido aqui, fica para decisão/planejamento de fase futura. 2 testes novos (um em cada arquivo de integração), total 124/124 passando; typecheck e build limpos.

Missão 006 — Fase 14 (15/09/2026): Mapa do Projeto, a pedido explícito do Founder ("construir uma página persistente no dashboard que registra tudo que foi feito, tudo que falta e novas ideias... qualquer agente atualiza ao fim de cada sessão, nunca perde histórico"). Nova tabela `command.project_log` (migration `supabase/migrations/0023_project_log.sql` no repo kairos-command, **pendente de aplicar em produção** como toda migration nova deste Core) guarda `agent`/`phase`/`type`/`title`/`description`/`commit`/`deployed`, append-only por convenção (nenhuma linha editada/apagada por este projeto), RLS habilitado sem nenhuma policy de escrita — só `service_role` grava. `api/_project-log.js` expõe `listProjectLog()`/`addProjectLogEntry()`; rota própria `api/project-log.mjs` (não consolidada num `[action].mjs` porque havia margem: 9/12 antes desta fase, fecha em 10/12) com `GET` **sem Basic Auth de propósito** (o Mapa é feito pra ser visível sem desbloquear o Painel Operacional — nunca carrega segredo, só o diário de bordo) e `POST` atrás da mesma Basic Auth do Painel. Nova página `ProjectMapPage` no sidebar (`roadmap`): contador de progresso (% `done`), filtros por tipo, grid de cards com fase/agente/commit/timestamp/link "em produção", formulário "Adicionar entrada" só com o Painel desbloqueado. `scripts/log-update.mjs` é o comando padrão que qualquer agente roda ao fim de uma sessão (mesmas credenciais `KAIROS_USER`/`KAIROS_PASS`, nenhum segredo novo); `scripts/seed-project-log.mjs` semeia as 13 fases já entregues desta missão (mais uma entrada `todo` sobre a lacuna do X e uma `idea` sobre a Missão 007), extraídas deste próprio arquivo e do git log — roda assim que o Founder aplicar a migration 0023. `AGENTS.md` ganhou a seção "Regra obrigatória — atualização do Mapa" documentando o comando padrão e a obrigação de registrar feito/pendente/bug ao fim de cada sessão. 8 testes novos (`tests/project-log.test.mjs`), total 132/132 passando; typecheck e build limpos. Bloqueado para uso real (ler/escrever de fato) até a migration 0023 ser aplicada.
## Atualização 22/09/2026 — Money Hunter v0.1

Iniciada a superfície operacional da Missão 008: `Hunter` agora possui Central de Demandas local para captura de oportunidades vistas em fontes autorizadas, triagem, qualificação, proposta pronta e acompanhamento. Não existe executor de coleta, scraping, login, envio de proposta ou conversa conectado por esta entrega. A próxima fatia exige fonte autorizada e persistência server-side, sem exceder o plano gratuito.

## Preparação operacional — migração da VPS KAIROS

Antes da Missão 005, executar o inventário privado da origem com `scripts/kairos-vps-inventory.sh`, selecionar uma VPS de destino com preço total confirmado e validar a réplica em paralelo. Não há compra, cancelamento ou corte da instância de origem neste registro.

## Próxima fatia — Kit reutilizável do agente KAIROS

Estado: **template e exportador implementados localmente; exportação da VPS pendente**.

1. Executar `scripts/export-kairos-agent-kit.sh` na origem apenas quando a conexão administrativa estiver estável.
2. Revisar a saída sanitizada, executar typecheck e confirmar que não há dados de tenant, `.env`, sessões, banco, mídia ou logs.
3. Criar o repositório público `KairosDigitalAGI/kairos-agent-kit` somente após essa auditoria.
4. Configurar uma instalação nova com ambiente, armazenamento e conexão oficial isolados antes de habilitar qualquer canal.

## Money Hunter — persistência local

Estado: **implementada localmente; backend e fontes continuam pendentes**.

A Central de Demandas persiste somente oportunidades registradas pelo Founder no navegador. Próxima evolução técnica: backend com prova de origem, tenant e auditoria antes de qualquer integração autorizada; comunicação externa permanece sujeita a aprovação explícita.

## 23/09/2026 — Visibilidade operacional e central comercial

**done** — Criados Money Lab e Analytics usando fontes autenticadas reais quando disponíveis, e adaptador somente-leitura de descoberta Freelancer. Commit pendente nesta sessão.

**todo** — Configurar uma fonte oficial de descoberta de projetos, com escopo read-only, e implementar importação revisável antes de qualquer proposta.

**todo** — Expor métricas sociais por APIs autorizadas e validar a ativação de webhooks Meta sem declarar atendimento automático como concluído.

## 23/09/2026 — Commercial Runtime v0.1

**done** — Criado `src/engines/commercial/runtime.ts`: ciclos comerciais têm estados explícitos, pausa isolada por autenticação e confirmação remota obrigatória antes de registrar um envio. Testes cobrem pausa e confirmação.

**todo** — Persistir execuções com auditoria no servidor e ligar o primeiro adaptador oficial autorizado ao runtime.

## 23/09/2026 — Ledger comercial

**done** — Consolidado o runtime no endpoint Hunter e implantado preview após corrigir o teto de 12 funções do Vercel Hobby. Commit `9f3fba2`.

**todo** — Aplicar migration 0026 no Supabase e ligar criação de execuções à captura de oportunidade no Hunter.

## Próxima missão concreta — Clone Engine: ingestão privada de referências

Implementar contrato e interface para registrar arquivos de imagem, vídeo e voz do Founder em armazenamento autenticado, com consentimento, escopo e revogação. Não processar biometria nem chamar provedores de clonagem até os arquivos autorizados e a integração escolhida existirem.

## Próxima missão concreta — Ingestão privada de referências

Estruturar o armazenamento autenticado para imagens, vídeos e voz autorizados do Founder, mantendo Clone, Personagens e Biblioteca como domínios separados. Não chamar provedores de biometria ou geração até haver consentimento e conector escolhido.

## Próxima missão concreta — Blockout do piloto

Criar o pacote de produção do piloto “O minuto zero”: lista de planos, prompts por cena, referências de cenário e dados para blockout, sem acionar modelo externo ou publicar.

Atualização 23/09/2026, acervo: a Biblioteca de filmes vai ler os ativos reais de `command.content_assets` após a migration, mantendo-os separados da galeria IndexedDB local. O primeiro job pode usar texto + Seedance após aprovação; permanece pendente aplicar migrations, ativar a flag de uma única execução e verificar o retorno de uso.

## Missão 011 — Kairos Signal (em andamento)

Confirmar schema/bucket do Content Engine, registrar o establishing shot textual e, após a confirmação do uso, decidir próximos planos. Press kits de KAIROS/ORION; Wilson aguarda consentimento e referências.

## Missão 012 — Studio de histórias (entregue)

- Consolidar História, Elenco, Produção e Biblioteca em uma única experiência criativa.
- Preservar clones privados e deixar autopilot condicionado a crédito, provider, job persistido, orçamento e confirmação remota.
- Próxima: armazenamento autenticado de referências do Founder e uma integração de edição escolhida e autorizada por destino.


## Missão 013 — Visual privado do Founder e storyboard ilustrado (próxima)

- Criar bucket/fluxo autenticado de referências pessoais para exibir o clone somente após autenticação.
- Gerar e registrar frames de storyboard por cena depois que o gerador de imagem tiver crédito disponível, sem publicar as referências humanas.



## Missão 014 — Assinatura Kairos Digital (entregue)

- Exibir a ampulheta oficial na plataforma e no Studio.
- Formalizar os elementos de marca para personagens, cenários e encerramentos de episódio.
- Próxima: criar referências visuais ficcionais seguindo a bíblia, sempre registrando a origem e sem enviar material humano a provedores.


## Missão 015 — Kairos Signal coral (entregue)

- Transformar a trilogia em narrativa de elenco, com conversação e conflito dramático responsável.
- Incluir papéis ficcionais para criação, pesquisa, produto, custo, valor e qualidade.
- Próxima: criar frames de storyboard e press kits ficcionais para cada integrante, registrando origem e aprovação antes de qualquer vídeo externo.


## Missão 016 — Console de geração e câmera (entregue)

- Expor modelo, prompt e rota de criação antes de registrar o primeiro job.
- Formalizar movimentos de câmera por plano e preservar close humano atrás dos gates de consentimento.
- Próxima: associar o storyboard de cada episódio a prompts por plano e a versões de press kit ficcional.

## Missão 017 — Storyboard e press kit textual (entregue)

- Associar cenas da trilogia a direção de câmera, transições e prompts explícitos dentro do Studio.
- Criar fichas repetíveis de direção para personagens ficcionais, sem gerar assets nem incluir pessoas reais.
- Próxima: revisar o schema real do Content Engine e converter apenas o establishing shot textual em job, quando a configuração e o orçamento forem confirmados.

## Missão 018 — Handoff do storyboard para pipeline (entregue)

- Permitir que um quadro cinematográfico preencha o formulário de ideia sem acionar geração.
- Preservar a separação entre rascunho local, job persistido, aprovação, custo e publicação.
- Próxima: auditoria somente leitura do estado real de schema/bucket antes de qualquer primeiro job Seedance.

## Missão 019 — Integridade do prompt de geração (entregue)

- Garantir que o prompt cinematográfico visível no Studio seja preservado até o adaptador Seedance.
- Cobrir o contrato com testes e manter fallback apenas para jobs legados.
- Próxima: superfície de prontidão que leia e explique o estado real de storage, gateway, aprovação e destino antes da primeira geração.

## Missão 020 — Pré-voo verificável de Seedance (entregue)

- Expor no Studio a prontidão real sanitizada de pipeline, Storage, flag e Gateway.
- Não expor credenciais nem criar recursos na checagem.
- Próxima: usar o pré-voo de produção para aplicar somente a configuração ausente e validar novamente antes de criar o primeiro job.

## Próxima missão concreta — press kit v0.4 e primeiro take

1. Receber as referências autorizadas do Founder para KAIROS e demais personagens do episódio 1.
2. Produzir as fichas visuais fictícias e o press kit completo antes de qualquer referência humana.
3. Após crédito confirmado na AI Gateway, registrar e aprovar o establishing shot textual. O teto vigente é US$ 5 total e não há publicação automática.

## Missão 021 — Press kits renderizados do elenco (entregue)

- Gerar e disponibilizar quatro folhas visuais ficcionais para os oito personagens do primeiro episódio da Kairos Signal.
- Aplicar a ampulheta Kairos como invariante de marca e registrar função, roupa, objeto e papel narrativo no Studio.
- Próxima: criar o primeiro job textual aprovado somente após a confirmação de crédito, mantendo as folhas como referência e sem anexar qualquer pessoa real.

## Missão 022 — Prólogo de 60 segundos e plano de crédito (em revisão operacional)

- Roteiro final do episódio 01 organizado em oito takes curtos com falas, narrador, áudio e direção de câmera.
- Studio mostra o plano de montagem e encaminha o Founder para a cobrança oficial da Vercel; nenhum cartão é coletado pelo Kairos.
- Próxima: confirmar saldo disponível e gerar somente o primeiro take aprovado; a continuação depende da revisão do resultado e do orçamento real devolvido pela Gateway.

## Missão 022 — Prólogo de 60 segundos e plano de crédito (revisada)

- Roteiro coral com Matheus, expressões, gestos individuais e contraste explícito entre mundo digital e mundo real de 2026.
- Saldo no Studio passa a ser uma ação prioritária que abre somente a cobrança oficial da Vercel; cartão não é coletado pelo Core.
- Próxima: gerar o take 01 aprovado com teto de US$ 5, registrar uso e então calcular o orçamento verificável dos sete takes restantes.
