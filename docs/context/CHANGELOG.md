# Changelog

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
