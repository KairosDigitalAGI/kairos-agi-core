# Changelog

## 23/09/2026 — Seedance 2.5 com Gateway limitada

- Adicionado `api/_providers/seedance.js`, adaptador de vídeo para `bytedance/seedance-2.5` via Vercel AI Gateway e `experimental_generateVideo` do AI SDK.
- Adicionado tier `gateway` ao Content Engine, limitado a 8 s, 9:16, 1280×720 e áudio, com persistência de `usage` retornado em `content_assets`.
- Separado o gate `KAIROS_ENABLE_SEEDANCE_GATEWAY` do gate genérico de APIs pagas: ativar o teste Seedance não abre OpenAI ou fal.ai. Job aprovado, migrations e autenticação OIDC continuam obrigatórios; não há retry automático.
- Criada a documentação operacional/custo em `docs/modules/SEEDANCE_GATEWAY_V0_1.md`. Nenhuma chamada ao modelo, gasto, upload de referência pessoal ou publicação foi executada.

## 22/09/2026 — preparação de migração da VPS KAIROS

- Corrigida a origem: a instância atual do agente KAIROS é HostGator, com cobrança mensal informada de R$ 54,98; não Hostinger.
- Adicionado `scripts/kairos-vps-inventory.sh`, inventário de sistema, capacidade, PM2 e portas que exclui `.env`, sessões, tokens e logs.
- A Hostinger KVM 2 foi registrada apenas como opção de contrato de dois anos: o preço anunciado dividido por mês não configura cobrança mensal. Nenhuma nova VPS foi contratada e a origem permanece intacta.

## 18/09/2026 — diagnóstico de produção do atendimento

- Versão com galeria de MP4/WebM implantada e observada no site oficial; tabela de inbox funcional e uma regra de Direct ativa carregada.
- `subscribed_apps` confirma `comments` e `messages` para @_kairosdigital_; a fila ainda não contém evento real.
- Meta mantém o app não publicado e informa que webhooks ao vivo exigem publicação. A URL de política de privacidade segue vazia no app.
- Google AI Studio mostra projetos Kairos em Nível gratuito, mas o caminho de LLM não ganhou chave nem ID do remetente. Continua desligado.
- Inbox agora indica prontidão da saudação sem expor segredo/ID; política pública corrigida para não prometer exclusão automática inexistente.

## 18/09/2026 — mídia generativa gratuita e saudação restrita

- Três imagens e duas cenas de 8 s geradas no Flow; cena composta de 16 s exportada, arquivos privados locais e projeto Flow preservado.
- Galeria aceita MP4/WebM importados com duração/resolução verificadas no navegador; sem upload automático.
- Corrigido `tier=free` do Veo: API sem faixa gratuita e sem fallback pago. APIs pagas dependem agora também de `KAIROS_ENABLE_PAID_MEDIA=true`.
- Preparado teste de “oi” via Gemini Flash-Lite gratuito para ID exato do Founder em comentários/Direct, desligado até confirmação do projeto sem faturamento e do webhook real.
- Consulta autenticada da assinatura `comments,messages` da conta Instagram; token saiu da URL para header Bearer na chamada de inscrição.

## 18/09/2026 — segurança e custo do Instagram

- Removido o fallback de IA paga para comentários/DMs sem regra aprovada.
- Restaurada a rejeição de POST sem segredo ou HMAC válido, sem expor prefixos de chaves em logs.
- Removido o token direto que ignorava a vinculação ao ID da conta conectada.
- O painel informa que respostas automáticas dependem de regra aprovada. Testes e build validados.

## 17/09/2026 — Atendimento Instagram, conciliação das implementações
- Produção em `main` atualizada até `99e0bcd`; challenge GET retornou 200 e POST sem assinatura foi recusado com 403. Corrigida a leitura do stream bruto da Vercel, que antes retornava 503 ao tocar no getter de `req.body`.
- No app Meta correto (`1572077540519784`), callback salvo e campos `comments` e `messages` confirmados como assinados. Assinaturas extras foram removidas. O app segue não publicado: a tela de publicação exige URL de política de privacidade e análise do app; nenhum webhook real de cliente foi validado.
- OAuth da conta profissional `_kairosdigital_` concluído e status real `connected:true` confirmado em produção. YouTube continua conectado.
- O webhook da rota estática e o da rota dinâmica usam o mesmo processador: challenge, HMAC do corpo bruto e deduplicação persistente. A implementação paralela que enviava texto gerado por LLM foi substituída no endpoint ativo, evitando custo inesperado e respostas duplicadas.
- Criados inbox server-side, resposta manual e regras de palavra-chave pausadas por padrão; ativação exige aprovação explícita do texto pelo Founder. DMs respeitam janela de 24 horas e a automação limita uma resposta por pessoa/canal/dia.
- Migration `0025_instagram_engagement.sql`, painel Atendimento, testes e documentação entregues no repositório. `META_WEBHOOK_VERIFY_TOKEN` consta na Vercel; faltam migration no Supabase mestre, publicação/análise do app Meta e teste ponta a ponta. A migration legada 0024 do Claude foi preservada, mas não é usada pelo novo fluxo.

## Missão 006, Fase 14 — Mapa do Projeto (15/09/2026)
- Nova tabela `command.project_log` (migration `supabase/migrations/0023_project_log.sql`, repo kairos-command, **pendente de aplicar em produção**): diário de bordo append-only (`agent`, `phase`, `type`, `title`, `description`, `commit`, `deployed`) do próprio desenvolvimento do Core — nunca editado/apagado por este projeto, RLS habilitado sem policy de escrita (só `service_role`).
- `api/_project-log.js` (`listProjectLog`/`addProjectLogEntry`) + rota própria `api/project-log.mjs`: `GET` lista tudo sem Basic Auth (o Mapa é feito pra ser visível sem desbloquear o Painel Operacional — nunca carrega segredo), `POST` exige a mesma Basic Auth do Painel. Rota nova, não consolidada num `[action].mjs` — havia margem (9/12 antes desta fase), fecha em 10/12.
- Nova página `ProjectMapPage` (rota `roadmap` no sidebar): contador de progresso, filtros por tipo (feito/pendente/ideia/bug), grid de cards com fase/agente/commit/timestamp, formulário "Adicionar entrada" atrás do Painel Operacional.
- `scripts/log-update.mjs`: CLI que qualquer agente roda ao fim de uma sessão para gravar uma entrada (mesmas credenciais `KAIROS_USER`/`KAIROS_PASS`, nenhum segredo novo). `scripts/seed-project-log.mjs`: semeia o histórico real das Fases 1-13 desta missão (extraído deste próprio CHANGELOG e do git log) assim que a migration 0023 for aplicada.
- `AGENTS.md` ganhou a seção "Regra obrigatória — atualização do Mapa": todo agente deve registrar o que fez, o que ficou pendente e bugs encontrados ao fim de cada sessão.
- 8 testes novos (`tests/project-log.test.mjs`): fail-closed sem Supabase, hint de migration pendente, leitura real, validação de `agent`/`type`/`title`, normalização de campos opcionais — total 132/132 passando. Typecheck e build limpos.
- Bloqueado para uso real até o Founder aplicar a migration 0023 em produção — mesma pendência de toda migration nova deste Core.

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
## 22/09/2026 — Money Hunter v0.1

- Substituído o placeholder do Hunter pela Central de Demandas local.
- Adicionada captura explícita de fonte, URL, orçamento informado e escopo observado; a interface não infere dados externos.
- Adicionado pipeline local de triagem → qualificada → proposta pronta → aguardando resposta.
- Documentação: `docs/modules/MONEY_HUNTER_V0_1.md`.

## 22/09/2026 — Kit modular reutilizável do KAIROS

- Criado `templates/kairos-agent-kit/` com contratos TypeScript de configuração, eventos, isolamento por tenant, auditoria e catálogo de skills. É uma base sem credenciais, sessões ou dados reais.
- Criado `scripts/export-kairos-agent-kit.sh` para copiar uma origem de VPS de forma sanitizada, excluir sessões, `.env`, bancos, mídias, logs e chaves, gerar somente nomes de variáveis em `.env.example` e interromper caso o scanner encontre prováveis segredos.
- Documentadas as capacidades `whatsapp-gateway`, `llm-router`, `lead-intelligence`, `content-ops` e `memory-state`. Nenhuma delas está ligada a execução externa por este incremento.
- Pendente: executar a exportação no servidor, revisar o resultado, validar o kit e só então criar/publicar `KairosDigitalAGI/kairos-agent-kit`.

## 22/09/2026 — Central de Demandas persistente

- A Central de Demandas agora mantém oportunidades capturadas localmente entre recargas, com contratos em `src/features/hunter/domain.ts` e `storage.ts`.
- Dados inválidos no armazenamento local são descartados; o módulo não estima orçamento, receita ou resultado de proposta.
- Não houve integração de scraping, login, mensagem, proposta ou WhatsApp. A persistência é local ao navegador e não substitui CRM/auditoria de servidor.

## Incremento 23/09/2026 — Money Lab, Analytics e descoberta autenticada

As superfícies `money-lab` e `analytics` deixaram de ser placeholders. `AnalyticsPage` reutiliza `useBusinessMetrics`, `useFleetStatus` e o mesmo desbloqueio do Painel Operacional para mostrar receita, MRR, clientes, saúde da frota e alertas somente quando a fonte responde `real`; indisponibilidade, credencial ausente e erro aparecem explicitamente. `MoneyLabPage` separa receita registrada da fila local do Money Hunter e não converte oportunidade em caixa.

Foi adicionado o contrato server-side de descoberta do Freelancer (`api/hunter.mjs` e `api/_freelancerDiscovery.js`). Ele só consulta uma URL oficial configurada no ambiente com token server-side e normaliza projetos completos; sem configuração, falha fechado. Não existe scraping, envio de proposta, mensagem, lance ou automação de contato. Testes do adaptador foram incluídos. Ver `docs/modules/MONEYLAB_ANALYTICS_V0_1.md`.

## 23/09/2026 — Ledger comercial e limite Hobby

`command.commercial_runs` foi definido em `supabase/migrations/0026_commercial_runtime.sql` para persistir ciclo, canal, etapa, proposta, origem, motivo e confirmação remota. A restrição de banco impede estado `completed` sem `remote_id`. A rota comercial foi consolidada em `api/hunter.mjs` (`GET ?action=runs`, `POST ?action=run`, `POST ?action=discover`) e o painel Hunter mostra execuções reais quando o Painel Operacional está desbloqueado. Os endpoints separados foram removidos para respeitar o teto de 12 funções do plano Vercel Hobby. Preview implantado com sucesso; migration continua pendente de aplicação no Supabase antes da persistência real.

## 2026-09-23 — Character Bible e press kit

- Entregue catálogo local `character` na Clone Engine para universo, papel, invariantes visuais, figurino, referências do press kit e direitos.
- Adicionado guia de continuidade com dez referências mínimas e testes de validação.
- Limite: o catálogo não armazena arquivos, não faz upload, treinamento biométrico, clonagem ou geração externa. Próxima etapa: fluxo privado de ingestão com consentimento e armazenamento autenticado.

## 2026-09-23 — Superfícies separadas de Clone, Personagens e Biblioteca

- Clone Engine agora contém apenas dados de identidade autorizada do Founder.
- Personagens ganhou página própria para Character Bible e press kit.
- Biblioteca de filmes ganhou página própria para a galeria local de MP4/WebM; a Video Engine mantém criação e pós-produção.

## 2026-09-23 — Bíblia de série “A Hora Certa”

- Preparada uma série original vertical com arco de oito episódios e piloto de 65 s, inspirada no processo técnico de blockout, referências e cenas curtas observado no vídeo enviado pelo Founder.
- Três imagens de press kit do Founder foram copiadas para `memory/private/clones/founder/2026-09-23/`, ignorado pelo Git, com manifesto de integridade. Nenhum treino, upload externo, clonagem ou publicação foi iniciado.
- Próxima etapa: cadastrar a autorização e referências no Clone Engine e criar o blockout do piloto antes de qualquer geração externa.

## 23/09/2026 — superfície visível da Gateway

- O Content Engine agora exibe o status da Seedance 2.5, ações por job e acesso direto ao acervo.
- A Biblioteca de filmes consulta os vídeos reais em `command.content_assets` além da galeria IndexedDB local, sem fundir os dois armazenamentos.
- O tier `gateway` aceita uma ideia aprovada como entrada textual para o primeiro establishing shot; o caminho não recebe material do Founder e continua condicionado à flag, OIDC e saldo.

## 23/09/2026 — Kairos Signal e programa de press kits

- Criada `docs/series/KAIROS_SIGNAL_TRILOGY_V0_1.md`: três episódios originais, com duração, planos de 8 s, câmera, voz, transição mundo virtual→real e prompt textual do establishing shot. O plano respeita o teto técnico de US$ 5: primeiro um único clipe textual e só depois decidir o restante por `usage` real.
- Criada `docs/series/CHARACTER_PRESS_KIT_PROGRAM_V0_1.md`: catálogo, entregáveis de vistas/figurino/movimento, convenção privada de arquivos e gate de consentimento. Nenhuma imagem, voz ou referência pessoal foi enviada a provedor.
- A aplicação das migrations 0020/0022 ainda não foi repetida: há registro de aplicação anterior no contexto e não havia credencial Supabase disponível nesta sessão para confirmar remotamente. A próxima execução deve verificar schema/bucket antes de qualquer SQL.

## 23/09/2026 — Character Studio visível

A página Personagens passa a expor press kits visuais originais de KAIROS e ORION, carregados de `public/characters/` e destinados à continuidade do universo ficcional. Founder e Wilson não aparecem nessa superfície: as referências deles permanecem privadas e condicionadas por consentimento e destino. Nenhum vídeo ou postagem foi disparado.

## 23/09/2026 — Job guiado para Kairos Signal

A interface ganhou briefing opcional por job e um template local do primeiro plano da trilogia. O template não escreve no banco por si só, não ativa a flag da Gateway e não faz geração. Ele permite que a criação real carregue uma descrição auditável de cena, incluindo a regra de não transmitir referências do Founder.

## 2026-09-23 — Kairos Studio v0.1

- A barra lateral passou a oferecer um único Studio para História, Elenco, Produção e Biblioteca.
- Kairos Signal ficou navegável por episódios, resumo, narração e gancho; a continuidade começa em Pausada e o modo Manual não executa jobs.
- O Founder aparece como referência privada local, sem imagem pública ou envio a provider. KAIROS/ORION seguem fictícios; Wilson permanece pendente de autorização.
- Pedido de edição é um rascunho local. Content Engine, Video Engine e acervo preservam seus gates de custo, provider e publicação.
- Validação: 
pm test (149 testes) e 
pm run build concluídos.


## 2026-09-23 — Roteiro editável e leitura guiada

- Kairos Signal ganhou três roteiros integrais editáveis, com cenas, falas e ganchos; o estado é local até conversão explícita em job.
- A direção de arte passou a usar ampulheta, paleta Kairos e avatares cinematográficos como guia para o elenco futuro.
- KAIROS e ORION passaram a aparecer com suas referências visuais públicas no elenco do Studio. A imagem do Founder não foi exposta nem enviada.
- A tentativa de gerar novas artes pelo gerador do plano retornou limite de uso; nenhuma imagem nova foi fabricada ou enviada.



## 2026-09-23 — Identidade Kairos Digital visível

- Incorporada a marca fornecida pelo Founder em `public/brand/` e aplicada à barra lateral e ao Kairos Studio.
- Criada a bíblia visual visível do elenco: ampulheta, paleta violeta/azul/magenta/preto, emblema por avatar e fechamento Kairos Digital.
- KAIROS e ORION receberam diretrizes de evolução que incluem a assinatura sem transformar referências de pessoas em assets públicos.


## 2026-09-23 — Kairos Signal coral

- Os três episódios do Studio foram reescritos para 96 s, com doze cenas e diálogo entre o elenco.
- Incluídos oito personagens ficcionais adicionais no elenco e uma pauta de vozes visível por episódio.
- O roteiro usa persistência local versionada para a nova história aparecer mesmo quando existir rascunho da versão anterior.


## 2026-09-23 — Console de geração e câmera

- A Produção agora exibe e permite editar o prompt do primeiro take Seedance antes de copiar o texto para um job.
- Criada escolha explícita entre Seedance Gateway e Kairos Motion local, sem alegar que providers desconectados podem gerar.
- Adicionada gramática visual de macro, dolly, órbita, rack focus, zoom e match-cut; autopublicação continua bloqueada até provas remotas.

## 2026-09-23 — Storyboard e press kit textual no Studio

- Criado `src/features/studio/storyboard.ts` com seis quadros de direção por episódio, cada um com movimento, transição, intenção e prompt original para preparação futura.
- O Studio exibe a leitura visual guiada e um press kit textual dos personagens ficcionais, mantendo Founder/Wilson fora dos prompts e dos assets públicos.
- Nenhuma imagem, vídeo, job, chamada de Gateway, gasto ou publicação foi criada por este incremento.
- Validação: `npm test` (149 aprovados) e `npm run build` concluídos.

## 2026-09-23 — Handoff do storyboard ao Content Engine

- Um quadro selecionado no Studio pode preencher título e briefing locais do formulário de criação de job.
- O handoff não faz POST, não aprova job e não chama provider; o rascunho só é removido depois de registro bem-sucedido.
- Validação: `npm test` (149 aprovados) e `npm run build` concluídos.
