# Evolução do Blueprint

## 2026-09-11 — Video Engine profissional
Video AI passa a planejar cada criativo a partir de oferta, público, promessa verificável, prova e chamada para ação. O pipeline oficial é: briefing, roteiro, frames de referência, cenas generativas, composição, QA, galeria, aprovação e distribuição. Cada execução externa deverá registrar provedor, modelo, estimativa, custo real, artefatos e aprovação.

A estratégia inicial reduz integrações usando a API da Runway como gateway de múltiplos modelos. O render local continua como alternativa de custo zero. YouTube e TikTok são destinos planejados e exigem OAuth, backend e consentimento antes do envio. Monetização é objetivo de negócio, não dado presumido: receita só entra no Core quando vier de fonte conectada e auditável.

Adendo gratuito: o formato padrão passa a oito segundos. Cotas legítimas podem ser combinadas por provedor, sempre com uma identidade autorizada por serviço e pausa ao esgotar. Google Flow é a principal fonte diária verificada; Kairos Motion local garante continuidade. Instagram e X entram na distribuição, sendo que X automático possui custo por chamada e requer autorização financeira futura.

O Integration Control Plane introduz a primeira função server-side de diagnóstico. Estado de configuração e conexão passam a ser contratos distintos: presença de credenciais não significa conta conectada. Meta e Google exigem OAuth e token store; X permanece manual no orçamento zero. Um roteiro de sete dias ordena fundação segura, publicação, métricas e operação acompanhada.

A distribuição manual do X nasce na galeria: texto validado, vídeo real e manifesto JSON compõem o pacote, sempre com `published: false`. Abrir o compositor não equivale a publicar e o envio permanece uma decisão explícita do Founder.

Este registro preserva a evolução da constituição `KAIROS_AGI_BLUEPRINT_V1.md`. O texto fundador permanece versionado; alterações de arquitetura são aditivas, rastreáveis e ligadas a decisões técnicas.

## 2026-09-10 — Adoção do Blueprint V1

### Incorporado

- Missão, regra econômica e filosofia de departamentos vivos.
- World OS com Dashboard 2D e World 3D.
- ORION, Dispatcher, Money Lab, Demand Network, Sales, Social, Studio, Factory, Vault e Shield.
- Engines, Founder Edition, Client Edition, Billing, gamificação e Task System.
- Cliente Zero, World 0.1, World 1.0 e roadmap fundador de 30 dias.

### Decisões de integração

- O projeto existente `Kairos AGI Core` continua como repositório e ambiente oficial.
- GitHub permanece como fonte do código; documentação e mudanças arquiteturais serão versionadas.
- Dashboard 2D e World 3D compartilharão os mesmos contratos e a mesma fonte de dados.
- Segredos do Vault serão armazenados apenas em mecanismo próprio de segredos, nunca no repositório.
- A infraestrutura continuará em planos gratuitos até autorização explícita para custos.

### Questões abertas

- Detalhar a identidade de produto de Carlos WhatsApp AI. Arthur é um agente de cliente e KAIROS é o robô pessoal do Founder; os dois não são intercambiáveis.
- ORB definido no Memory Sync V1 como Operational Runtime Beacon; hardware futuro fora do escopo atual.
- Definir stack de aplicação, modelo de tenancy, fronteiras do Core e esquema de Ordens de Serviço.
- Converter o roadmap fundador de 30 dias em entregas técnicas estimadas após os contratos do Core.

### Próxima versão planejada

O Blueprint V2 deverá detalhar Core, ORION, Vault, Shield, Billing, Memory, Engines, Factories, Supabase, GitHub, World 3D, aplicativos Founder/Cliente e fluxos de venda, onboarding e entrega.

## 2026-09-10 — Missão 001: Cliente Zero

### Implementado

- Founder Dashboard com métricas operacionais mockadas.
- Founder Tower em React Three Fiber com ORION, KAIROS, Instagram AI e Hunter AI.
- Task System gamificado com avanço local de estado, XP e Kairos Coins.
- CRM com identificadores anônimos e dados fictícios.
- Instagram Engine demonstrativa, sem integração externa.
- Navegação completa da Founder Edition e placeholders para módulos futuros.

### Decisões

- KAIROS é o robô pessoal do Founder; Arthur permanece restrito ao contexto de cliente.
- React, TypeScript e Vite formam a base do frontend v0.1.
- React Three Fiber e Drei implementam o World 0.1.
- `src/data/mock` é a fonte única de dados demonstrativos até a camada de persistência.
- O pacote 3D é carregado sob demanda quando o usuário abre o World.

## Memory Sync V1 e Missão 002

Conversa fornecida pelo Founder adotada como adendo curado em KAIROS_MEMORY_SYNC_V1.md. Original preservado em memory/private, ignorado pelo Git. Estrutura docs/context e docs/blueprint adicionada sem substituir documentos fundadores.

ORB definido como Operational Runtime Beacon, hardware futuro. KAIROS continua robô do Founder e Arthur restrito a cliente. Identificações de clientes removidas da revisão pública atual do Blueprint, substituídas por CLIENT_001–004; histórico Git antigo não foi reescrito, portanto ainda contém a publicação anterior.

Instagram passa de tela mock para fluxo editorial manual local: ideias, materiais, pipeline, calendário, prompts, decisão do Founder e histórico. Estado editorial compartilhado em Core; Dashboard e World refletem a mesma fila. Dados persistem apenas no navegador, com validação e aviso de falha. API, IA e publicação reais continuam desconectadas.

Missões 003–008 registradas na fila; não implementadas por este sync. Recomendação de separar estratégia em repositório privado registrada sem mudar a visibilidade do repositório existente.

## 11/09/2026 — Memory Sync V1.1 e Missão 003
Adendo oficial preservado em KAIROS_MEMORY_SYNC_V1_1.md: Money Hunter com cinco equipes, Score Kairos, Ideas Vault, Clone Engine modular, VideoProvider, Content Brain, Asset Library, separação pública/privada e fila renumerada. Missão ativa limitada a 003.
A instrução direta de usar apenas dados reais substitui o requisito antigo de mocks na interface. O Blueprint original não foi refeito. Dados ausentes ficam indisponíveis; nenhum agente simula execução.

## 11/09/2026 — Missão 004
Video Engine ganhou execução local real no navegador. O caminho gratuito usa Canvas, Web Audio e MediaRecorder para produzir WebM. Provedores de geração continuam definidos como futuras integrações e não são apresentados como ativos.

Correção aprovada pelo Founder: Video Engine deve criar conteúdo do zero. Foi adicionado o gerador local de motion graphics por roteiro; o fluxo com arquivo passou a ser pós-produção. O escopo gratuito não inclui síntese fotorealista de pessoas ou ambientes.

### Adendo escrito pelo Founder
Interface séria e imersiva: painel 2D transparente sobre ambiente 3D contextual, reaproveitando o acervo. Progresso corresponde a trabalho cadastrado e revisão, sem inventar ganhos. Mantido foco econômico, sem promessa de receita.

## Correção do organograma — Kairos OS
Importados os 15 papéis do cadastro data/agents/agents.json do Kairos OS; CEO mapeado para ORION, WhatsApp para KAIROS, Hunter para Hunter AI, preservando sourceId. Acrescentados 12 papéis/especializações documentados no Blueprint e adendos. Total: 27 configurações, não 27 executores ativos.

A nova página Agentes contém busca, departamento, responsabilidades, indicador-alvo, origem, vínculo hierárquico e acesso ao painel relacionado. Os quatro modelos de reunião são exibidos como propostas de agenda, sem automação. Nenhum saldo, cliente ou token foi importado.

Dashboard e World usam o mesmo cadastro operacional. O Dashboard resume seis agentes e oferece acesso explícito ao organograma completo. O World instancia os 27, exibe balão apenas na seleção/hover para reduzir sobreposição e permite selecionar qualquer agente pelo nome. Fechar o inspetor agora oculta o painel.

O código do motor/importador existente na origem é evidência de implementação, não prova de conexão com este Core. Os executores continuam desconectados. A hierarquia dos 15 papéis originais responde a ORION; vínculos dos especialistas dos adendos são organização adotada neste Core, não importação literal do organograma original.

## 14/09/2026 — Consolidação Kairos e Missão 006, Fase 1
Founder autorizou reunir os três repositórios reais (kairos-command, kairos-os, kairos-agi-core) num único braço operacional, reaproveitando o que já existe e construindo apenas o que faltar. Este Core é a base confirmada (ver docs/REUSE_PROVENANCE.md). Arthur segue restrito a cliente Allfix, fora deste escopo; KAIROS é o robô pessoal do Founder no WhatsApp `62981554992`.

Fase 1 conecta o Dashboard ao Supabase mestre do kairos-command (schema `command`) por leitura server-side: receita do mês, receita total, MRR e clientes ativos/total (`api/business-metrics.mjs`), e frota de agentes WhatsApp com alertas críticos (`api/agent-status.mjs`). Ambas as rotas exigem Basic Auth própria deste projeto, desbloqueada por sessão via `OperationsUnlock`; sem credencial ou sem configuração, o Dashboard mantém os placeholders reais (`—`), nunca inventa número. Nenhuma migration, RLS ou processo pm2 de origem foi tocado.

Diretriz do Founder para as próximas fases (chat de agentes, Content Engine): os agentes que operam a empresa devem rodar preferencialmente nos planos pagos já assinados (OpenAI GPT, Anthropic Claude); créditos OpenRouter são reserva de último caso, não escolha padrão.

## 14/09/2026 — Missão 006, Fase 2: chat de agentes
Reaproveitada a arquitetura de provider trocável do kairos-os (`agents/ceo/providers/index.js`, CLAUDE.md: "nunca acople um agente diretamente a um provider de LLM específico"), reimplementada zero-dependência neste Core em `api/_providers/`. Diferença deliberada em relação à origem: a ordem `auto` agora prioriza Anthropic e OpenAI (planos pagos do Founder) antes de OpenRouter, que vira reserva de último caso — antes o chat do kairos-os usava OpenRouter como default. Motivo: instrução direta do Founder (14/09/2026) para não desperdiçar assinatura já paga.

O chat é estritamente consultivo: nenhum agente deste Core tem executor conectado, e o system prompt (`api/_agent-chat.js`) proíbe o modelo de fingir ter executado qualquer ação. Números vêm do mesmo cálculo real da Fase 1 (`api/_business.js`, agora compartilhado entre business-metrics, agent-status e o chat) — indisponibilidade é sempre dita como tal, nunca virou zero nem foi inventada.

## 14/09/2026 — Missão 006, Fase 3: schema do Content Engine
Desenhado o schema do pipeline de conteúdo em `kairos-command/supabase/migrations/0020_content_engine.sql`, seguindo as convenções já estabelecidas no schema `command` (idempotente, colunas `criado_em`/`atualizado_em` com `touch_atualizado_em()`, RLS via `command.is_operador()`, sem policy de escrita — leitura do operador, escrita só service_role): `content_jobs` (o job do pipeline, etapa `ideia → roteiro → imagem → video → legenda → aprovacao → publicado/rejeitado`, com o gate de aprovação do Founder explícito), `content_assets` (Asset Library, um registro por etapa concluída, com `gratuito`/`custo_usd` para nunca confundir geração gratuita com paga), `content_calendar` (agenda por canal), `prompt_library` (prompts reutilizáveis) e `avatars` (gamificação por `agente_slug`, referenciando `data/agentRegistry.json` deste Core por convenção, não por FK — o registro vive no repo).

Esta migration segue o mesmo padrão já usado nesta conta para SQL que o Founder aplica manualmente (Kairos ADS tem duas migrations pendentes de colar): **fica redigida e versionada, mas não é aplicada automaticamente** — nenhuma ferramenta deste ambiente tem permissão de rodar DDL direto no Supabase de produção sem o Founder revisar.

Neste Core, a primeira fatia de aplicação chega em `api/content-jobs.mjs` (GET lê o pipeline real, POST registra uma ideia nova) e `ContentEnginePanel` no Dashboard. Como a migration ainda não foi colada em produção, toda leitura/escrita aqui reporta "indisponível"/503 citando o arquivo pendente — nunca fabrica job. `api/_command.js` ganhou `writeCommand()`, a primeira escrita real que este Core faz no schema `command` (Fases 1 e 2 eram só leitura); o padrão de segurança (service_role, `Content-Profile: command`) segue o mesmo da leitura. Motor de geração (roteiro/imagem/vídeo/legenda) e OAuth do YouTube continuam como próximas fases.

## 14/09/2026 — Missão 006, investigação Hunter Skill encerrada
Auditoria de código (não implementação) verificou que o framing herdado de sessão anterior — "3 implementações divergentes do Hunter Skill precisando consolidação" — estava desatualizado e nunca chegou a existir como descrito. `kairos-command/supabase/migrations/0018_hunter_leads.sql` já se autodeclara "SUPERSEDIDA — NÃO APLICAR" no próprio arquivo: o Hunter real que atende a Sofia lê/escreve um Supabase **diferente** (projeto da VPS da Sofia, schema `tenant_id`/`agent_slug`/`nome_empresa`/`abordado`), não o schema `command` deste ecossistema. O painel (`kairos-command/src/lib/hunter/dados.ts`) e a ponte HTTP para a VPS (`kairos-command/src/lib/sofia/hunter.ts`, rotas `/hunter/status`/`/hunter/cacar` protegidas por Bearer contra `CHAT_SECRET`) já funcionavam ponta a ponta — confirmado ao vivo via `curl` público na VPS (200 na rota real vs 404 de rota inexistente), já que SSH read-only foi bloqueado pelo classificador de permissões deste ambiente. `kairos-hunter-skill` (repo `matheusschelle/kairos-hunter-skill`) é um template genérico de scraping (Playwright→SQLite→lowdb) não instalado em nenhum cliente ativo; `kairos-leadgen` é um funil B2B frio por e-mail, produto diferente. Nenhum dos três precisava ser "unificado" com os outros. Único ajuste real: comentários/copy desatualizados em `kairos-command` que ainda descreviam `/hunter/*` como ausente — corrigidos nesse repo (commit `834cc7d`), sem mudança de lógica.

## 14/09/2026 — Missão 006, Fase 4: OAuth do YouTube
Primeira integração de publicação ativada de verdade — diferente de Instagram/TikTok, que seguem esperando aprovação de app da Meta, o YouTube não tem esse gate: um OAuth Client Web do Google Cloud Console basta. Desenhado o cofre de tokens em `kairos-command/supabase/migrations/0021_integracoes_tokens.sql` (`command.integracoes_tokens`), deliberadamente **fora** do padrão de RLS do resto do schema `command`: as outras tabelas dão SELECT para `command.is_operador()` (dev/founder logado no painel); esta não tem policy nenhuma, nem para o operador — só `service_role` (o backend, atrás da própria Basic Auth do kairos-agi-core) lê ou escreve. Um vazamento de sessão do painel não deve conseguir puxar ciphertext de token de produção.

Neste Core, `api/_crypto.js` isola a cifra (`encrypt`/`decrypt`, AES-256-GCM, chave derivada por sha256 de `KAIROS_TOKEN_ENCRYPTION_KEY` — a mesma variável já declarada como pré-requisito em `api/integrations/status.mjs` desde a preparação do Control Plane) e a assinatura do `state` do OAuth (`signState`/`verifyState`, HMAC-SHA256 com janela de 10 minutos). A escolha de não usar uma tabela de nonce para o `state` é deliberada: o Google devolve exatamente o que este backend mandou, então validar a assinatura mais o tempo decorrido prova que o callback corresponde a um `connect-url` gerado há pouco, sem precisar de sessão nem storage no meio.

`api/_youtube.js` orquestra o fluxo: `buildConnectUrl()` monta a URL de consentimento do Google (falha fechada citando o env var exato faltando — `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`/`GOOGLE_OAUTH_REDIRECT_URI` — quando o cliente OAuth não está configurado); `completeConnection()` troca o código pelo access/refresh token, confirma o canal via YouTube Data API e grava cifrado com `upsertCommand()` (nova função em `api/_command.js`, escrita idempotente por coluna de conflito — reconectar substitui o token antigo, não duplica linha); `computeYoutubeStatus()` e `disconnectYoutube()` completam o CRUD. Todo caminho de falha (sem migration aplicada, sem credencial do Google, `state` adulterado ou expirado, Supabase fora do ar) tem uma mensagem específica — nunca um 500 genérico nem uma conexão fingida.

As rotas ficam em `api/integrations/youtube/`: `connect-url`, `status` e `disconnect` atrás da mesma Basic Auth do Painel Operacional (mostrar qual canal está conectado já é dado de negócio real, diferente do `/api/integrations/status` original que só expõe booleano de configuração e por isso segue sem essa guarda); `callback` é a exceção deliberada — o redirect do Google não consegue carregar um header `Authorization`, então a prova de legitimidade vem inteiramente do `state` assinado, não da credencial. O callback nunca devolve token na URL de volta: só um sinal `?youtube=connected` ou `?youtube=error&reason=...`, que a `IntegrationsPage` lê uma vez no boot e limpa da URL. Como este app não tem router de URL, `App.tsx` ganhou um suporte mínimo a `?module=` só para reabrir a aba Integrações depois do redirect, sem virar um sistema de rotas.

12 testes novos (`tests/youtube-integration.test.mjs`) cobrem cifra/decifra (inclusive com chave errada), assinatura e expiração do `state`, e fail-closed em cada uma das ausências de configuração — total 50/50 passando. Ativação real (o Founder conseguir de fato conectar um canal) segue bloqueada em duas frentes fora do alcance deste agente: aplicar a migration 0021 em produção, e criar o OAuth Client Web no Google Cloud Console (criação de conta/credencial permanece proibida para automação).

## 14/09/2026 — Missão 006, Fase 5: geração real de roteiro no Content Engine
Primeiro estágio do motor de geração que a Fase 3 tinha deixado como escopo futuro: transformar uma ideia registrada (`etapa=ideia`) num roteiro real (`etapa=roteiro`), chamando um provider de LLM pago. A pergunta que precisava de resposta antes de escrever qualquer linha era se isso violava a regra inviolável "NUNCA ativar geração paga sem aprovação explícita do Founder". Duas âncoras resolveram isso: primeiro, o Founder já tinha dado essa direção explicitamente numa sessão anterior, ao desenhar as próximas fases ("Aplicar isso ao desenhar as próximas fases: chat de agentes, geração de roteiro/copy no Content Engine" — mesma diretriz que já autorizou a Fase 2); segundo, a própria Fase 2 (chat de agentes) já estabeleceu o precedente de que um clique explícito do Founder por ação, disparando uma chamada a um provider pago, é a fronteira de autorização aceita neste código — nunca geração em lote, nunca automática. `generateScript({jobId})` segue exatamente esse molde: um `jobId` por chamada, nunca uma fila.

Uma segunda dúvida veio do próprio schema: o comentário de `content_assets.gratuito` na migration 0020 parece amarrar geração paga a `job.aprovado`. Conferindo a ordem do `check constraint` de `etapa` (`ideia → roteiro → imagem → video → legenda → aprovacao → publicado/rejeitado`), fica claro que `aprovacao`/`aprovado` é o portão de pré-*publicação*, perto do fim do pipeline — não um portão de pré-*geração* no começo. Gerar um roteiro a partir de uma ideia não passa por esse portão; publicar, sim, vai passar (fase futura). Essa leitura ficou documentada em comentário direto acima de `generateScript()` em `api/_content.js`, para não precisar ser redescoberta.

Implementação: `generateScript()` valida `jobId` (400), confirma Supabase configurado (503), busca o job real via `readCommand` (404 se não existe, 409 se a etapa não é `ideia` — nunca regenera silenciosamente um roteiro que já existe), seleciona o provider pago via `selectProvider` (mesma ordem Anthropic → OpenAI → OpenRouter da Fase 2, 503 se nenhuma chave estiver configurada), monta o prompt a partir do `titulo`/`briefing` real do job (nunca inventa contexto de negócio), chama `provider.chat()` (502 ou o status do provider se a chamada falhar) e, só em caso de sucesso, grava o roteiro em `command.content_assets` via `writeCommand` e avança `content_jobs.etapa` para `roteiro` via `patchCommand()` — helper novo em `api/_command.js`, PATCH por filtro PostgREST com `Prefer: return=representation`, seguindo o mesmo padrão de `writeCommand`/`upsertCommand`/`deleteCommand` já usados nas fases anteriores. Se a migration 0020 ainda não tiver sido aplicada, qualquer uma dessas leituras/escritas falha citando o arquivo exato, nunca um 500 genérico.

Rota `api/content-jobs/generate-script.mjs`, atrás da mesma Basic Auth do Painel Operacional; coexiste sem conflito com `api/content-jobs.mjs` (mesmo basename, extensões diferentes — confirmado com `node --check` e listagem de diretório, sem deploy real). `useContentPipeline` ganhou `generateScript(jobId)`/`generatingJobId`/`generateError`; `ContentEnginePanel` ganhou o botão "Gerar roteiro", visível só nos jobs em `etapa=ideia`, desabilitado enquanto aquele job específico está gerando.

6 testes novos (`tests/content-engine.test.mjs`) cobrem toda a cascata de falha fechada (400/503/404/409/503) e um caminho de sucesso completo com um mock de `fetch` roteado por URL (chamada real ao formato da Anthropic API + as três chamadas PostgREST) — total 56/56 passando, `npm run typecheck` e `npm run build` limpos. Fora de escopo: imagem, vídeo, legenda — a `etapa` avança só até `roteiro` por enquanto.
