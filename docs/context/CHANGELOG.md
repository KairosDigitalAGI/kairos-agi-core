# Changelog

## Ativação Instagram — permissões operacionais (15/09/2026)
- App Meta `Kairos AGI Core` configurado para Instagram Login com callback de produção.
- Escopos mínimos prontos para teste: perfil profissional, publicação de conteúdo, moderação de comentários e mensagens Direct.
- O backend passa a pedir os quatro escopos no mesmo OAuth e continua cifrando o token no cofre existente.
- Nenhum escopo de anúncios ou insights foi adicionado. Comentários e Direct ainda precisam de handlers/webhooks e interface antes de serem operados pelo Core.

## Ativação operacional do YouTube — canal real conectado (15/09/2026)
- Habilitada a YouTube Data API v3 no projeto Google Cloud `kairos-495011`, permanecendo na cota gratuita padrão.
- OAuth concluído com os escopos mínimos já implementados: `youtube.readonly` e `youtube.upload`.
- Canal validado pelo backend de produção: `Kairos Digital`, handle `@KairosDigitalAGI`, channel ID `UC2TqvTgMsTkywGQS3oiYDsg` e link público `https://www.youtube.com/channel/UC2TqvTgMsTkywGQS3oiYDsg`.
- O token permanece cifrado no cofre `command.integracoes_tokens`; nenhum segredo foi escrito no repositório. Uploads da Fase 8 continuam privados por padrão e só partem de job real aprovado.
- Nenhuma alteração de código foi necessária para a conexão. Esta entrada corrige os estados documentais antigos que ainda diziam que o consentimento estava pendente.

## Missão 006, Fase 13 — link direto para a conta social conectada (15/09/2026)
- `api/_youtube.js#computeYoutubeStatus()` passou a selecionar `account_id` (o ID real e estável do canal, gravado desde a Fase 4 em `completeConnection`) e devolve `profileUrl: https://www.youtube.com/channel/{account_id}` — zero chamada nova à API do Google, é só montar a URL a partir de um dado que já estava salvo.
- `api/_instagram.js#computeInstagramStatus()` deriva um `username` a partir de `account_label` só quando ele começa com `@` (formato gravado por `completeInstagramConnection` quando a Graph API devolve `username`); nesse caso devolve `profileUrl: https://www.instagram.com/{username}/`. Quando `account_label` é um nome de exibição sem `@` (a Graph API não devolveu `username`), devolve `profileUrl: null` — nunca inventa um link a partir de um nome que não é garantidamente um handle válido de URL.
- `src/types/integration.ts#SocialConnectionStatus` ganhou o campo `profileUrl: string | null` na variante `connected: true`. `api/integrations/[provider]/[action].mjs` não precisou de nenhuma mudança — a ação `status` é um pass-through puro do retorno do adapter.
- `IntegrationsPage.tsx`: quando conectado e `profileUrl` existe, mostra o link "Ver conta conectada" (abre em nova aba, ícone `ExternalLink`); quando `profileUrl` é `null`, mostra uma frase explicando que o provedor não devolveu um identificador público suficiente para montar o link — nunca esconde a ausência silenciosamente.
- X (Twitter) fica de fora desta fase: não existe OAuth nem `integracoes_tokens` para X no Core hoje (`api/integrations/status.mjs` trata X como `mode:'manual-free'`, sem conta armazenada), então não há "conta conectada" real para linkar ainda — fica registrado como lacuna para uma fase futura, não resolvido aqui.
- 2 testes novos (`tests/youtube-integration.test.mjs`, `tests/instagram-integration.test.mjs`): URL construída a partir do dado real e `null` quando falta o identificador seguro, nos dois provedores — total 124/124 passando. Typecheck e build limpos.

## Missão 006, Fase 12 — publicação real de Reels no Instagram (15/09/2026)
- `api/_instagram.js` ganhou `getValidInstagramAccess()`, `createReelsContainer()`, `checkContainerStatus()` e `publishReelsContainer()`: o fluxo de três passos da Content Publishing API da Meta (criar container com `video_url` pública → consultar `status_code` até `FINISHED` → `media_publish`). Sem `refresh_token` separado como o YouTube — o próprio access_token de longa duração se renova contra si mesmo (`grant_type=ig_refresh_token`), com 1 dia de folga antes de vencer; sem token salvo, 404; vencido demais pra renovar, 401 pedindo reconexão manual.
- `api/_content.js` ganhou `postToInstagram({jobId, caption})`: mesmo gate de `postToYoutube` (etapa=video 409, aprovado 402), mesma fonte de vídeo (`content_assets.storage_path`, já público). Grava o `creation_id` em `content_calendar` (`status:"agendado"` — reaproveitado por ser o único valor do enum real, confirmado na migration 0020, que serve pra "ainda não publicado"; não existe `'processando'` no schema) ANTES de esperar o processamento, pra sobreviver a uma function encerrada no meio do polling: a próxima chamada lê o mesmo registro e retoma do mesmo container em vez de criar um segundo. Polling com orçamento curto (~24s por padrão) e configurável via `INSTAGRAM_POLL_INTERVAL_MS`/`INSTAGRAM_POLL_MAX_TENTATIVAS` (mesma convenção de `api/_providers/fal.js`, pra testes rodarem rápido e determinísticos); se ainda `IN_PROGRESS` ao esgotar o orçamento, devolve `status:"processando"` sem erro — nunca bloqueia a function nem finge sucesso. Job já publicado é short-circuit puro, sem chamar a Meta de novo.
- Nenhuma rota nova: a ação `post-instagram` foi somada ao `api/content-jobs/[action].mjs` já existente (mesmo arquivo consolidado da Fase 8/11), mantendo o total em 9/12 Serverless Functions do plano Hobby.
- `useContentPipeline` ganhou `postToInstagram()` (reaproveita `generatingJobId`/`generateError`; trata `status:"processando"` como aviso, não erro). Botão "Postar no Instagram" em `ContentEnginePanel`, ao lado do "Postar no YouTube", para jobs em `etapa=video` já aprovados.
- 10 testes novos (`tests/instagram-reels.test.mjs`): 400/503/404/409/402/409-sem-asset, short-circuit de job já publicado, retomada de container já criado (nunca abre um segundo), sucesso completo (criação→IN_PROGRESS→FINISHED→publicação→`content_calendar`/`content_jobs`) e o caminho `status:"processando"` (orçamento de polling esgotado, sem erro) — total 122/122 passando. Typecheck e build limpos.
- Fecha a lacuna que a própria Fase 11 documentou em `docs/modules/SOCIAL_OAUTH_V0_5.md` ("Ela não publica Reels"). Continua bloqueado pra ativação real pelas mesmas pendências da Fase 11 (`META_APP_ID`/`META_APP_SECRET`/`META_OAUTH_REDIRECT_URI` e consentimento do Founder).

## Missão 006, Fase 11 — Social OAuth consolidado (15/09/2026)
- Corrigido o travamento observado ao conectar YouTube: o formulário agora valida Basic Auth no servidor antes de salvar a sessão, credenciais antigas inválidas são removidas e respostas 401 de API não acionam o prompt HTTP nativo do navegador.
- Sincronizadas e preservadas as Fases 1–10 que chegaram ao `main` remoto.
- Instagram profissional ganhou OAuth real, token longo cifrado e validação do perfil antes de persistir.
- YouTube e Instagram agora compartilham um hook de interface e uma rota dinâmica por provedor/ação.
- As quatro funções separadas do YouTube foram consolidadas; o total público caiu de 12 para 9 no plano Vercel Hobby.
- URLs e comportamento do YouTube foram preservados, incluindo Basic Auth, HMAC, refresh token e upload privado.
- Instagram permanece desconectado até `META_APP_ID`, `META_APP_SECRET` e `META_OAUTH_REDIRECT_URI` existirem na Vercel e o Founder concluir o consentimento.
- 110 testes passam; typecheck e build passam. Nenhuma mídia foi publicada nesta fase.

## Consolidação Kairos — Missão 006, Fase 8: publicação real no YouTube (14/09/2026)
- `api/_youtube.js` ganhou `getValidAccessToken()`: decifra o access_token salvo (Fase 4), e se estiver vencido (ou a <60s de vencer) troca pelo `refresh_token` via `grant_type=refresh_token`, persiste o novo `access_token_enc`/`expires_at` via `upsertCommand` (payload parcial — não mexe em `account_id`/`refresh_token_enc`/etc.) e devolve o token pronto pra usar. Sem canal conectado, 404; sem `refresh_token` salvo e token vencido, 401 pedindo reconexão manual — nunca tenta reautenticar sozinho.
- `api/_youtube.js` ganhou `uploadVideo({accessToken, title, description, tags, videoBuffer})`: multipart/related montado à mão (boundary aleatório, zero SDK), `POST .../upload/youtube/v3/videos?uploadType=multipart`. Sobe com `privacyStatus:"private"` por padrão de propósito — o agente publica no canal do Founder, mas não torna o vídeo público sozinho.
- `api/_content.js` ganhou `postToYoutube({jobId, title, description, tags})`: exige `etapa==="video"` (409 caso contrário) e `aprovado:true` (402 caso contrário) antes de baixar o vídeo do `content_assets.storage_path`, subir pro YouTube e gravar o resultado. **Desvio deliberado e documentado** do plano original da migration 0020 ("etapa=aprovacao é o gate do Founder; nada publica antes disso"): como legenda/aprovacao ainda não têm motor, esta fase reaproveita `content_jobs.aprovado` — o mesmo booleano que já cobre todo o gasto pago do job — como o sinal explícito do Founder também para publicar, em vez de deixar a função morta esperando as Fases 9/10. Revisitar quando legenda/aprovacao ganharem motor de verdade.
- Sucesso grava `command.content_calendar` (`canal:"youtube"`, `status:"publicado"`, `referencia_externa:<videoId>`) e avança `content_jobs.etapa` para `publicado`. Se a escrita local falhar depois do upload já ter acontecido (vídeo real e irreversível no YouTube), o erro cita o `videoId` para conferência manual — nunca tenta subir de novo (duplicaria o vídeo).
- Rota `api/content-jobs/post-youtube.mjs`, mesma Basic Auth. `useContentPipeline` ganhou `postToYoutube()`; botão "Postar no YouTube" em `ContentEnginePanel` para jobs em `etapa=video` já aprovados.
- 9 testes novos entre `tests/content-engine.test.mjs` (gates 400/503/404/409/402/409-sem-asset + sucesso completo) e `tests/youtube-integration.test.mjs` (`getValidAccessToken`: token ainda válido, renovação real, 401 sem refresh_token, 404 sem canal; `uploadVideo`: corpo multipart, sucesso, erro real do Google) — total 94/94 passando.
- Continua bloqueado para ativação real pelos mesmos motivos da Fase 4 (migrations 0021/0020 pendentes, OAuth Client do Google pendente de criação).

## Consolidação Kairos — Missão 006, Fase 7: geração real de vídeo, motor free-tier (14/09/2026)
- Dois providers novos, mesmo espírito zero-dependência do resto do Core: `api/_providers/veo.js` (Google Veo via AI Studio, `GOOGLE_AI_KEY`, dispara + faz polling de `operations/{name}` até `done`) e `api/_providers/fal.js` (fal.ai, fila assíncrona `queue.fal.run`, `FAL_KEY`; exporta `MODEL_FREE` = Kling v1.6 standard e `MODEL_PAID` = Kling v2.1 Master).
- `api/_content.js` ganhou `generateVideo({jobId, tier})`: exige `etapa==="imagem"` (409 caso contrário). `tier="free"` (padrão) tenta o Veo primeiro; se devolver 429 (cota esgotada) ou não estiver configurado, cai pro Kling v1.6 do fal.ai — **mas esse fallback não é gratuito de verdade** (fal.ai cobra por segundo de vídeo, apesar do nome "fallback free" na especificação original), então continua exigindo `content_jobs.aprovado:true` (402 sem isso) antes de gastar, igual às outras etapas pagas: rotular um provider de "free" no pedido não basta pra pular a regra inviolável de nunca gastar sem aprovação explícita do Founder. `tier="paid"` usa direto o Kling v2.1 Master, sempre exige `aprovado:true`.
- O vídeo gerado NÃO sobe pro bucket `content-assets`: a URL que o provider devolve (Veo/fal, pode ser temporária/assinada) é gravada direto em `content_assets.storage_path` — diferente da imagem, que sobe binário pro Storage. Fase 8 busca o binário direto dessa URL.
- Rota `api/content-jobs/generate-video.mjs`, mesma Basic Auth. `useContentPipeline` ganhou `generateVideo(jobId, tier)`. `ContentEnginePanel`: botão "Gerar vídeo (grátis)" para jobs em `etapa=imagem`, e "Gerar vídeo (premium)" só quando já aprovado.
- 13 testes novos (`tests/content-engine.test.mjs`): 400 (jobId/tier inválido)/503/404/409/402 (paid sem aprovado, free sem Veo e sem aprovado)/503 (paid sem FAL_KEY, free sem nenhum provider) e três caminhos de sucesso (Veo puro, fallback 429→Kling, paid direto Kling v2.1 Master) — total 79/79 passando.
- Fora de escopo: legenda — ainda sem motor.

## Consolidação Kairos — Missão 006, Fase 6: geração real de imagem no Content Engine (14/09/2026)
- `api/_providers/openai.js` ganhou `generateImage({prompt, size})`: Images API da OpenAI (`gpt-image-1`), devolve `b64_json`. Único provider deste Core com geração de imagem — Anthropic não tem esse recurso, sem fallback quando `OPENAI_API_KEY` ausente.
- Migration `kairos-command/supabase/migrations/0022_content_assets_bucket.sql` redigida: cria o bucket público `content-assets` no Supabase Storage (`insert into storage.buckets ... on conflict do nothing`, idempotente) — mesmo padrão do bucket `videos` já usado pelo kairos-command. `command.content_assets.storage_path` já existia desde a migration 0020, mas nenhum bucket real existia até agora. **Pendente de aplicar em produção.**
- `api/_storage.js` (novo): `uploadToStorage()`/`publicStorageUrl()`/`safePath()` via REST puro (zero dependência, mesmo espírito de `_command.js`), sem SDK.
- `api/_content.js` ganhou `generateImage({jobId})`: mesma cascata de falha fechada de `generateScript` (400/503/404/409), reaproveita o gate `content_jobs.aprovado` (402) da correção anterior — uma única aprovação por job cobre todas as etapas pagas, roteiro e imagem inclusive. Sem `OPENAI_API_KEY`, falha citando exatamente essa variável. Monta o prompt a partir do título/briefing do job e do roteiro já gerado (contexto real, nunca inventado); grava `content_assets.storage_path` e avança `content_jobs.etapa` para `imagem`.
- Rota `api/content-jobs/generate-image.mjs`, mesma Basic Auth. `useContentPipeline` ganhou `generateImage()` (reaproveita `generatingJobId`/`generateError`, já que roteiro e imagem nunca ficam disponíveis ao mesmo tempo no mesmo job). Botão "Gerar imagem" em `ContentEnginePanel` para jobs em `etapa=roteiro`.
- 7 testes novos (`tests/content-engine.test.mjs`): 400/503/404/409/402/503(sem OPENAI_API_KEY) e um caminho de sucesso completo com mock de fetch roteado por URL (Images API + upload de Storage + `content_assets` POST + `content_jobs` PATCH) — total 67/67 passando.
- Fora de escopo: vídeo, legenda — ainda sem motor de geração conectado.

## Consolidação Kairos — Missão 006, correção pós-Fase 5: gate de aprovação de gasto (14/09/2026)
- Auto-revisão no mesmo dia da Fase 5 encontrou uma lacuna: `generateScript` chamava o provider pago só checando `etapa === 'ideia'`, sem checar `content_jobs.aprovado` — o schema (comentário em `command.content_assets.gratuito`, migration 0020) já exigia `aprovado:true` explícito do Founder antes de qualquer geração paga, e isso não estava sendo checado. O gate de etapa `aprovacao` (pré-publicação, mais adiante no pipeline) é uma coisa diferente do booleano `content_jobs.aprovado` (gate de gasto, checável a qualquer momento) — a Fase 5 original conflou os dois.
- `generateScript` agora recusa com **402** quando `job.aprovado !== true`, antes mesmo de selecionar o provider.
- `approveContentJob({jobId})` (novo em `api/_content.js`) + rota `api/content-jobs/approve.mjs`: grava `aprovado:true`/`aprovado_por`/`aprovado_em` via `patchCommand` — ação explícita e separada do clique "Gerar roteiro".
- UI: `ContentEnginePanel` mostra "Aprovar geração paga" primeiro nos jobs em `etapa=ideia` ainda não aprovados; "Gerar roteiro" só aparece depois. `useContentPipeline` ganhou `approveJob()`/`approvingJobId`/`approveError`.
- 6 testes novos (`tests/content-engine.test.mjs`): 402 sem aprovação, os testes de sucesso/sem-provider atualizados para partir de um job já aprovado, mais 3 testes de `approveContentJob` (503 sem Supabase, 404 job inexistente, sucesso gravando os três campos) — total 60/60 passando.

## Consolidação Kairos — Missão 006, Fase 5: geração real de roteiro no Content Engine (14/09/2026)
- `api/_content.js` ganhou `generateScript({jobId})`: primeiro estágio do motor de geração do Content Engine, `etapa ideia→roteiro`. Um clique do Founder por job, nunca em lote — mesma fronteira de autorização já entregue e sem objeção na Fase 2 (chat de agentes).
- Validações em cascata, cada uma com status HTTP próprio: 400 sem `jobId`, 503 sem Supabase configurado, 404 job não encontrado, 409 job que não está em `etapa=ideia` (nunca regenera silenciosamente um roteiro já existente), 503 sem provider de LLM pago configurado, 502/status-do-provider se a chamada ao LLM falhar, 503 com o nome da migration pendente se a escrita final falhar.
- Usa `selectProvider` (mesmo seletor da Fase 2): Anthropic → OpenAI → OpenRouter, prioridade do Founder. Prompt montado a partir do `titulo`/`briefing` real do job — nunca inventa contexto.
- `api/_command.js` ganhou `patchCommand()` (PATCH via PostgREST, usado para avançar `content_jobs.etapa` depois de gravar o asset em `content_assets`).
- Rota `api/content-jobs/generate-script.mjs`, atrás da mesma Basic Auth do Painel Operacional. `useContentPipeline` ganhou `generateScript()`/`generatingJobId`/`generateError`; botão "Gerar roteiro" em `ContentEnginePanel` aparece só nos jobs em etapa `ideia`.
- Nota de design: o campo `aprovacao`/`aprovado` do schema é o portão de pré-*publicação*, mais adiante na cadeia `ideia → roteiro → imagem → video → legenda → aprovacao → publicado/rejeitado` — não bloqueia a geração de roteiro a partir de uma ideia.
- 6 testes novos (`tests/content-engine.test.mjs`): 400 sem jobId, 503 sem Supabase, 404 job inexistente, 409 etapa errada, 503 sem provider, e um caminho de sucesso completo com mock de fetch roteado por URL (Anthropic + `content_jobs` GET/PATCH + `content_assets` POST) — total 56/56 passando.
- Fora de escopo desta fase: imagem, vídeo, legenda — ainda sem motor de geração conectado.

## Consolidação Kairos — Missão 006, Fase 4: OAuth do YouTube (14/09/2026)
- Migration `kairos-command/supabase/migrations/0021_integracoes_tokens.sql` redigida: `command.integracoes_tokens`, uma linha por provedor, `access_token`/`refresh_token` sempre cifrados antes de tocar o Supabase. RLS habilitado sem NENHUMA policy — nem o operador logado no painel lê; só `service_role`. **Pendente de aplicar em produção** — o Founder precisa colar no SQL Editor do Supabase.
- `api/_crypto.js`: AES-256-GCM (`encrypt`/`decrypt`) para os tokens e HMAC-SHA256 com janela de 10 min (`signState`/`verifyState`) para o `state` do OAuth — sem tabela de nonce, a assinatura + o tempo bastam para provar que o callback corresponde a um `connect-url` recente deste backend.
- `api/_youtube.js`: monta a URL de consentimento do Google, troca o código pelo access/refresh token, confirma o canal via YouTube Data API (`channels?part=snippet&mine=true`) e grava cifrado; falha fechada com o env var exato faltando quando o cliente OAuth do Google está incompleto, e com o nome da migration pendente quando a tabela não existe.
- Rotas `api/integrations/youtube/{connect-url,status,disconnect}.mjs` atrás da Basic Auth do Painel Operacional; `callback.mjs` sem essa guarda de propósito (o Google não manda header de auth no redirect), validado pelo `state` assinado.
- `api/_command.js` ganhou `upsertCommand()` (escrita idempotente por coluna de conflito — reconectar substitui, não duplica) e `deleteCommand()` (usado só por "Desconectar").
- `IntegrationsPage`: botão "Conectar canal"/"Desconectar" no card do YouTube, atrás do mesmo `OperationsUnlock` do Dashboard; lê o sinal `?youtube=connected|error` que o `callback` deixa na volta do Google e limpa a URL.
- 12 testes novos (`tests/youtube-integration.test.mjs`): cifra/decifra com chave errada, assinatura e expiração do `state`, fail-closed sem credencial do Google e sem a migration — total 50/50 passando.
- Ativação real (o Founder de fato conseguir conectar um canal) depende de ele criar um OAuth Client Web no Google Cloud Console e habilitar a YouTube Data API v3 — criação de conta/credencial não é automatizada por este agente.

## Consolidação Kairos — Missão 006, investigação Hunter Skill encerrada (14/09/2026)
- Sem mudança de código neste Core. Auditoria (git history + leitura de código em `kairos-command`, `kairos-hunter-skill`, `kairos-leadgen`) corrigiu o framing herdado de sessão anterior ("3 implementações divergentes precisando consolidação"): não havia consolidação pendente.
- O Hunter que atende a Sofia é feature madura e funcionando ponta a ponta: painel em `kairos-command` (Supabase **separado**, projeto da VPS da Sofia) + motor de coleta na própria VPS + ponte HTTP (`/hunter/status`, `/hunter/cacar`) já aplicada em produção e confirmada ao vivo por `curl` público (200 real vs 404 de rota inexistente).
- `kairos-hunter-skill` é template genérico não instalado em nenhum cliente ativo; `kairos-leadgen` é produto diferente (funil B2B frio por e-mail). Nenhum dos dois precisa de consolidação com o Hunter da Sofia.
- Único ajuste necessário: comentários/copy desatualizados em `kairos-command` (`src/lib/sofia/hunter.ts`, `src/components/cliente/CacarLeads.tsx`) que ainda descreviam a ponte HTTP como ausente — corrigidos nesse repo, commit `834cc7d`.

## Consolidação Kairos — Missão 006, Fase 3: schema do Content Engine (14/09/2026)
- Migration `kairos-command/supabase/migrations/0020_content_engine.sql` redigida: `command.content_jobs`, `command.content_assets`, `command.content_calendar`, `command.avatars`, `command.prompt_library`; idempotente, RLS `command.is_operador()` só leitura, escrita exclusivamente service_role. **Pendente de aplicar em produção** — o Founder precisa colar no SQL Editor do Supabase.
- `api/content-jobs.mjs` (GET lista o pipeline real, POST registra uma ideia nova) + `api/_content.js`; `ContentEnginePanel` no Dashboard com formulário de nova ideia e lista por etapa.
- Sem a migration aplicada: GET reporta `source: 'unavailable'` citando o arquivo pendente; POST falha fechado com 503. Nunca fabrica job nem etapa.
- `api/_command.js` ganhou `writeCommand()` (POST via PostgREST, `Content-Profile: command`) — primeira escrita real feita por este Core em `command` (as anteriores, Fases 1/2, eram só leitura).
- 4 testes novos (`tests/content-engine.test.mjs`): unavailable sem credencial, hint de migration pendente na leitura e na escrita — total 40/40 passando.

## Consolidação Kairos — Missão 006, Fase 2: chat de agentes (14/09/2026)
- Chat consultivo com qualquer um dos 27 agentes do organograma, via `api/agent-chat.mjs` + `AgentChatPanel` (botão "Conversar" em `AgentsPage`).
- Provider de LLM trocável (`api/_providers`): Anthropic (Claude) e OpenAI (GPT) primeiro — planos pagos já assinados pelo Founder —, OpenRouter só como reserva de último caso. Seleção automática por credencial presente; nenhuma chave aparece no cliente.
- System prompt inclui a identidade real do agente e os números reais de receita/MRR/clientes/frota (mesmo cálculo da Fase 1); deixa explícito que o chat não executa nada — nenhum agente tem executor conectado a este Core ainda.
- Mesma Basic Auth do Painel Operacional (Fase 1); sem credencial, o painel de chat fica trancado.
- `api/business-metrics.mjs` e `api/agent-status.mjs` refatorados para reusar `api/_business.js`, evitando duas fontes de verdade para o mesmo cálculo.
- 36/36 testes passando (6 novos cobrindo prioridade de provider, fail-closed sem credencial, e não-fabricação de número).

## Consolidação Kairos — Missão 006, Fase 1 (14/09/2026)
- Dashboard passa a ler receita do mês, receita total, MRR e clientes ativos/total do Supabase mestre (schema `command`, mesmo banco do kairos-command), via `api/business-metrics.mjs` server-side.
- Frota de agentes WhatsApp (pm2, `command.agents`) e últimos alertas críticos (`command.events`) expostos em painel próprio (`FleetPanel`), via `api/agent-status.mjs`; somente leitura, nunca chama pm2.
- Ambas as rotas ficam atrás de Basic Auth própria deste projeto (`KAIROS_USER`/`KAIROS_PASS`), desbloqueada por sessão via `OperationsUnlock`; sem credencial, o Dashboard mantém os placeholders `—` normalmente.
- Nenhuma migration, RLS ou schema de origem foi alterado; nenhum dado foi fabricado — indisponibilidade é sempre reportada com o motivo real.

## Control Plane de integrações — preparação do lançamento em sete dias
- Página Integrações adicionada ao Founder OS com status obtido de função server-side.
- Endpoint Vercel informa presença de configuração Meta, Google e token store sem expor segredos.
- Instagram e YouTube permanecem desconectados até OAuth e Supabase; X permanece manual para custo zero.
- Cronograma de sete dias registrado no produto e na documentação.
- Galeria de vídeos passa a preparar manifesto e texto para publicação manual gratuita no X, sem marcar o conteúdo como publicado.

## Evolução da Video Engine — pipeline generativo e custo
- Briefing real de oferta, público, promessa, prova e CTA com roteiro derivado apenas do que o Founder informar.
- Catálogo versionado de modelos de vídeo e imagem com preços oficiais em USD e orçamento antes da geração.
- Runway adotada como gateway proposto para Gen-4, Veo, Gemini Image e GPT Image; APIs seguem desconectadas.
- YouTube e TikTok registrados como destinos com custo de API zero, requisitos reais e estado desconectado.
- Nenhuma conta foi conectada, mídia publicada ou despesa gerada.
- Modo curto alterado para oito segundos com roteiro em duas cenas.
- Roteador gratuito documenta Flow, Runway Free, Higgsfield Free e fallback local; não alterna contas para contornar cotas.
- Instagram e X adicionados aos destinos; custo real do X API registrado e caminho manual gratuito preservado.

## Missão 002 — Instagram editorial e Memory Sync V1
- Adotados contexto, fila de missões, protocolo AGENTS.md e índice modular do Blueprint.
- Banco de ideias com tema, categoria, prioridade, data e materiais editáveis.
- Pipeline com requisitos por etapa e revisão versionada pelo Founder.
- Calendário por data, biblioteca de prompts editável e painel de aprovação reutilizado no Dashboard.
- Estado editorial local compartilhado, validação de formato e aviso quando armazenamento falha.
- Status do Instagram AI derivado da mesma fila no Dashboard e World.
- Contrato de Graph API desconectado, sem tráfego externo nem publicação.
- Analytics com cinco indicadores explicitamente fictícios.
- Identificações de clientes substituídas por IDs na revisão atual do Blueprint público; histórico anterior preservado.
- Testes de domínio, persistência serializada e bloqueio de publicação adicionados.
- Limites: dados por navegador; sem autenticação, geração de mídia, banco ou sincronização de dispositivos.

## Missão 001 — 1125d02
Founder Core v0.1 com Dashboard, World 0.1, CRM mock, Tasks, Coins e placeholders. Build e deployment validados na entrega original. Controles visuais sem ação e estado de Tasks reiniciado ao navegar são limitações legadas, não resolvidas pela Missão 002.

## Fundação — 66e954c
Adoção inicial do Blueprint V1, preservando arquitetura e infraestrutura existentes.

## Missão 003 — 11/09/2026
- Adotado Memory Sync V1.1; papéis oficiais no AGENTS.md; fila renumerada até 010.
- Clone Engine: catálogos vazios, produção manual, pipeline com requisitos, revisão, consentimento e aprovação versionada; providers desconectados.
- Removidos exemplos da interface e falsa telemetria; migração editorial preserva o acervo antigo.
- Perfil Instagram informado pelo Founder registrado sem alegar integração.
- Inventariados 49 repositórios; análise técnica seletiva e plano de composição privado, sem alterar fontes.
- Validação de domínio e build; sem conexão externa, despesas, treinamento de clone ou publicação social.

### Adendo visual na entrega 003
Escritório 3D legado extraído e compartilhado entre World e fundo do painel; câmeras por departamento, modo foco, transparência e progresso real de preparação/produção. EmptyState do Command adaptado. Removidos controles de cabeçalho sem ação. Proveniência documentada.

## Correção do organograma — Kairos OS
Importados os 15 papéis do cadastro data/agents/agents.json do Kairos OS; CEO mapeado para ORION, WhatsApp para KAIROS, Hunter para Hunter AI, preservando sourceId. Acrescentados 12 papéis/especializações documentados no Blueprint e adendos. Total: 27 configurações, não 27 executores ativos.

A nova página Agentes contém busca, departamento, responsabilidades, indicador-alvo, origem, vínculo hierárquico e acesso ao painel relacionado. Os quatro modelos de reunião são exibidos como propostas de agenda, sem automação. Nenhum saldo, cliente ou token foi importado.

Dashboard e World usam o mesmo cadastro operacional. O Dashboard resume seis agentes e oferece acesso explícito ao organograma completo. O World instancia os 27, exibe balão apenas na seleção/hover para reduzir sobreposição e permite selecionar qualquer agente pelo nome. Fechar o inspetor agora oculta o painel.

O código do motor/importador existente na origem é evidência de implementação, não prova de conexão com este Core. Os executores continuam desconectados. A hierarquia dos 15 papéis originais responde a ORION; vínculos dos especialistas dos adendos são organização adotada neste Core, não importação literal do organograma original.

## Missão 004 — Video Engine local
- Editor utiliza arquivos reais selecionados no dispositivo e mostra duração, resolução e tamanho lidos do arquivo.
- Corte por intervalo, formatos 9:16, 1:1, 16:9 ou original; qualidades até 480p, 720p e 1080p.
- Composição de marca d'água e logo, áudio original opcional e música local com volume controlado.
- Render WebM e download no navegador, com progresso, cancelamento e histórico de metadados.
- Limites: 500 MB e 10 minutos por render; compatibilidade depende de Chrome/Edge e codecs do arquivo.
- Sem upload, backend, API, publicação, geração por IA ou custo externo.
- Correção de escopo do Founder: criação do zero tornou-se o fluxo principal; o editor foi mantido como pós-produção.
- Adicionados storyboard determinístico, três direções visuais, cenas animadas, transições, marca e trilha ambiente sintetizada localmente.
- A geração parte somente do título e roteiro do Founder e produz um arquivo real, sem mídia de entrada, upload ou custo de API.
- Galeria local persistente adicionada com blobs em IndexedDB, player, download e remoção confirmada; vídeos antigos que existiam apenas como URL temporária não podem ser recuperados.
