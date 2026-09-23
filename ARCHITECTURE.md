# Arquitetura — proposta inicial

## 18/09/2026 — mídia gratuita e saudação de teste

O Flow oficial produz ativos generativos usando a cota exibida na própria conta; o navegador baixa os MP4/JPEG originais e a Video Engine importa MP4/WebM para IndexedDB, sem servidor de upload nem publicação implícita. A API `generateVideo(tier=free)` recusa a antiga suposição de Veo gratuito. Roteiro, imagem e vídeo por APIs pagas exigem `KAIROS_ENABLE_PAID_MEDIA=true` além da aprovação do job; o modo custo zero deixa a flag ausente. O tier isolado `gateway` usa `bytedance/seedance-2.5` via Vercel AI Gateway e exige apenas a flag específica `KAIROS_ENABLE_SEEDANCE_GATEWAY=true`, job aprovado e autenticação OIDC do deployment; ele não libera outros providers. O fallback permanente é o render Canvas/WebM local. O projeto do Flow e os arquivos produzidos são descritos em `docs/modules/VIDEO_ENGINE_V0_4.md`, e o contrato da Gateway em `docs/modules/SEEDANCE_GATEWAY_V0_1.md`.

O Instagram preserva HMAC, conta OAuth vinculada, deduplicação, janela de 24 h e cooldown. Um caminho adicional, isolado, responde somente ao “oi” do ID numérico do Founder com `gemini-2.5-flash-lite` de projeto Free Tier confirmado; nenhuma mensagem do remetente além da palavra fixa é enviada à LLM. Flags ausentes deixam esse caminho desligado. A assinatura `subscribed_apps` da conta agora é consultável via rota autenticada, sem token na URL. O app Meta publicado e evento real continuam requisitos independentes. Ver `docs/modules/FOUNDER_GREETING_V0_1.md`.

O webhook de Instagram rejeita todo POST sem `META_APP_SECRET` ou HMAC válido. Eventos são processados somente após validação, com deduplicação, conta vinculada e regras de resposta aprovadas; mensagens sem regra exigem revisão humana, exceto o teste restrito de saudação do Founder quando suas flags e ID estiverem configurados. O endpoint autenticado de inbox expõe apenas indicadores booleanos de prontidão, nunca a chave ou o ID. A resposta livre por LLM e o token direto sem verificação da conta não integram o caminho de produção.

## Atendimento Instagram — incremento 17/09/2026

`api/integrations/instagram/webhook.mjs` e a rota dinâmica `api/integrations/[provider]/[action].mjs` delegam ao mesmo processador; a rota estática é o endpoint efetivo na Vercel. `api/_instagramEngagement.js` valida HMAC sobre bytes brutos, normaliza comentários/Direct e usa `command.instagram_engagement_events` como fonte de verdade da fila. Regras aprovadas em `command.instagram_automation_rules` não saem do backend; cooldown persistente impede mais de uma resposta automática por pessoa/canal/dia. A UI apenas mostra estado e coleta a aprovação literal do Founder. Falha ambígua fica em revisão, sem retry que duplique mensagens. Ver `docs/modules/INSTAGRAM_ENGAGEMENT.md`. O callback foi verificado e `comments`/`messages` assinados; o recebimento real ainda depende da migration, publicação/análise Meta e teste real.

## Evolução da Video Engine
`providerCatalog.ts` mantém capacidades, unidade de cobrança, preço em USD, fonte e data de verificação. `ProductionPlanner` transforma somente os campos informados pelo Founder em roteiro e calcula o orçamento antes de gerar. O provedor local é executável; todos os modelos pagos ficam desconectados até existir adaptador server-side, segredo no Vault e limite de orçamento.

`distribution.ts` registra Instagram, YouTube, TikTok e X como destinos desconectados. A publicação futura passa por backend autenticado, armazenamento privado de tokens, aprovação por ativo e consulta do status remoto. Nenhum segredo, OAuth ou chamada de publicação vive no frontend público.

`freeTierCatalog.ts` descreve cotas verificadas, renovação, capacidade de clipes de oito segundos e marca d'água. O roteador futuro usa um vínculo OAuth por provedor, registra saldo real e pausa no esgotamento; não alterna contas para evitar limites. `distribution.ts` também cobre Instagram e X. Como o X API cobra por escrita, a estratégia gratuita exporta o pacote para publicação manual aprovada.

## Integration Control Plane

`api/integrations/status.mjs` é a primeira função server-side do Core. Ela informa se a configuração necessária existe sem expor valores. `IntegrationsPage` consome esse contrato e mantém `connected: false` até existir prova do OAuth persistida no servidor. A Missão 006 implementará o token store com Supabase, criptografia e RLS antes dos callbacks OAuth. O X usa exportação e publicação manual no orçamento zero.

### Social OAuth consolidado — 15/09/2026

O token store já existe em `command.integracoes_tokens`. `api/_youtube.js` e `api/_instagram.js` validam a identidade remota e cifram tokens com AES-256-GCM. A rota dinâmica `api/integrations/[provider]/[action].mjs` preserva `connect-url`, `callback`, `status` e `disconnect` para ambos os provedores em uma única função Vercel. A contagem caiu de 12 para 9 funções públicas, mantendo margem no plano Hobby. O Instagram solicita somente `instagram_business_basic`, `instagram_business_content_publish`, `instagram_business_manage_comments` e `instagram_business_manage_messages`; comentários e mensagens ainda exigem handlers e webhooks próprios antes de aparecerem no produto.

Início, status e desconexão exigem o Basic Auth do Painel Operacional. O callback valida `state` HMAC com validade curta, pois o provedor não reenvia o cabeçalho Basic Auth. O YouTube possui renovação e upload privado e está conectado ao canal real Kairos Digital. O Instagram também está conectado à conta `_kairosdigital_`; a publicação assíncrona de Reels exige job aprovado no servidor. O novo webhook de atendimento depende de configuração e teste externos, separados do OAuth.

Esta arquitetura implementa progressivamente a constituição em `KAIROS_AGI_BLUEPRINT_V1.md`. O Blueprint define os domínios; este documento registra como eles serão separados e integrados.

## Camadas

1. **Interface**: Founder Edition em React e TypeScript, com Dashboard 2D e Founder Tower 3D. A aplicação está hospedada na Vercel Hobby.
2. **Serviços**: APIs e workers com contratos em `packages/`; tarefas longas podem executar na Hostinger VPS.
3. **Automação**: n8n aciona serviços autenticados, com identificadores de execução, limites, retries e idempotência.
4. **Dados**: Supabase para dados operacionais, identidade e artefatos. Separar Development e Production; aplicar isolamento por usuário/empresa e políticas RLS antes de acesso cliente.
5. **IA**: conectores de modelos com seleção explícita de modelo, orçamento, timeout e rastreamento; Astra é a referência solicitada, OpenRouter e Gemini Flash são componentes planejados.
6. **Conhecimento**: Markdown curado em `memory/`, compatível com Obsidian. Importações brutas permanecem fora do Git.

## Fluxo de execução proposto

Usuário → Dashboard → API autenticada → fila/workflow → agente → conector → resultado/auditoria → Dashboard.

Cada execução deve ter estado, responsável, histórico, custo estimado/real e mecanismo de interrupção. Conteúdos externos não autorizam ações. Ações financeiras, credenciais e comunicações devem obedecer às autorizações registradas.

## Contratos iniciais a implementar

- Agent: id, módulo, versão, capacidades e status.
- Task: id, objetivo, responsável, prioridade, estado e timestamps.
- Run: task_id, modelo, estado, tentativas, custo e resultado.
- Approval: run_id, ação, escopo, decisão e autor.
- AuditEvent: origem, ator, ação, referência e timestamp.

## Mapa modular do Blueprint V1

| Módulo | Responsabilidade | Dependências principais |
| --- | --- | --- |
| Kairos Core | Identidade da instalação, clientes, configuração e eventos centrais | Dados, auditoria |
| ORION | Priorização, coordenação e distribuição estratégica | Dispatcher, Task System, aprovações |
| Dispatcher | Ordens de Serviço, roteamento e acompanhamento | Engines, Factories, filas |
| Task System | Missões, checklist, XP, prioridade, prazo e impacto | Core, auditoria |
| Billing | Planos, franquias, consumo e cobrança | Clientes, uso, aprovações financeiras |
| Vault | Referências seguras para credenciais e identidades | Provedor de segredos, controle de acesso |
| Shield | Políticas, logs, alertas, backup e auditoria | Todos os módulos |
| Memory | Conhecimento curado, decisões e recuperação contextual | Core, agentes |
| Engines | Departamentos operacionais e vendáveis | Dispatcher, Billing, integrações |
| Factories | Produção, QA e deploy de entregáveis | Dispatcher, Engines, Shield |
| Founder Edition | Controle integral da Kairos e de todos os clientes | Todos os domínios |
| Client Edition | Acesso limitado aos módulos contratados | Billing, permissões, Engines |
| World OS | Dashboard 2D e World 3D sobre contratos compartilhados | Founder/Client Edition |

Cada módulo terá contrato próprio e poderá evoluir sem duplicar identidade, tarefas, uso, aprovação ou auditoria. O World 3D é uma visualização do estado operacional; não mantém uma segunda fonte de verdade.

## Compatibilidade com a fundação existente

- KAIROS é o robô pessoal do Founder e não pode ser substituído por Arthur. Arthur pertence a um cliente e fica fora da infraestrutura Founder. `Carlos WhatsApp AI` permanece como item legado do backlog até sua identidade de produto ser detalhada.
- `ORB` = Operational Runtime Beacon, hardware futuro conforme Memory Sync V1; não implementar agora.
- Os módulos Hunter, Kairos Ads, Site Maker, Financeiro, Conteúdo e Infraestrutura serão relacionados às Engines e aos distritos correspondentes durante o detalhamento do V2.

## Ambientes

Development: dados sintéticos e credenciais próprias. Production: configuração separada, domínio e acesso revisados. A Vercel usa `main` para produção e cria deployments automaticamente a partir do GitHub; previews devem usar variáveis próprias. Nenhum segredo de servidor deve ser entregue ao navegador.

## Kairos Core v0.1

A Missão 001 estabelece uma aplicação cliente sem backend. `src/core` agrega o estado compartilhado; `src/types` define os contratos; `src/data/mock` é a única fonte dos dados demonstrativos. Dashboard, World, Tasks, CRM e Instagram consomem esses contratos sem integração externa.

O World 0.1 usa React Three Fiber e Drei. ORION, KAIROS, Instagram AI e Hunter AI são instâncias do mesmo tipo `FounderAgent`; o painel lateral e os balões leem a mesma coleção mockada. KAIROS é o robô pessoal do Founder. Arthur permanece fora da infraestrutura da Founder Edition.

O frontend usa divisão de código para carregar o pacote 3D apenas quando o usuário abre o World. Navegação e estado de Tasks existem apenas na sessão do navegador nesta versão.

## Não implementado no v0.1

Endpoints, persistência, autenticação, migrações SQL, filas, integrações com Instagram ou WhatsApp e armazenamento de credenciais. O Vault é apenas um placeholder seguro. Não existe sincronização automática entre arquivos locais e fontes do ChatGPT.

## Incremento Missão 002

EditorialProvider em src/core é a fonte única do estado editorial, com persistência local versionada. src/engines/instagram/domain.ts concentra validação de etapas, revisão e aprovação; os tipos vivem em src/types/instagram.ts. Mocks são apenas a semente inicial e analytics fictícios.

ContentEditor, PromptLibrary e ApprovalQueue compõem a Engine. O Dashboard reutiliza ApprovalQueue. useFounderAgents deriva Instagram AI da fila editorial e entrega o mesmo estado para Dashboard e World. FounderTower recebe agentes por props sem duplicar lógica.

Aprovar marca a revisão e move para Publicação, que continua bloqueada. Edição invalida a aprovação. O InstagramGateway é um contrato futuro; disconnectedGateway rejeita publicação sem tráfego externo. Aprovações locais não são autorização confiável de servidor.

Limites: sem backend, autenticação, geração de mídia, integração Meta ou sincronização entre dispositivos/abas. Os dados editoriais sobrevivem à navegação e recarga no mesmo navegador; Tasks da Missão 001 mantêm o comportamento legado. Documentação: docs/modules/INSTAGRAM_ENGINE_V0_2.md.

## Incremento Missão 003 — prevalece sobre os estados históricos acima
Memory Sync V1.1 e AGENTS.md definem papéis, Money Hunter e fila 003–010. A interface de produção não consome mais mocks; src/data/operational.ts contém configurações e indisponibilidade explícita. Não representa backend conectado.

CloneProvider é a fonte única do Clone; domain.ts concentra revisão e pipeline. LibraryPanel é reutilizado entre identidade, voz, rosto, avatar, prompts, ativos e Content Brain. CloneApprovalQueue serve Engine e Dashboard. VideoProvider define limite substituível de provedores, sem chamadas. Contratos Founder/Client não concedem acesso: Client Edition aguarda autenticação/tenant no servidor.

Vault continua sem armazenamento de valores secretos. Separar referências operacionais públicas da documentação privada ignorada pelo Git. Estado manual local não é log confiável de servidor. Integrações futuras devem autenticar aprovação e revalidar versões e direitos no servidor.

A revisão dos repositórios fundamenta reaproveitamento por adaptadores: memória documental separada de telemetria, executores legados isolados, edição de vídeo separada de publicação. Não fundir bancos nem instâncias de clientes. Detalhes em docs/REPOSITORY_REUSE_STRATEGY.md e docs/modules/CLONE_ENGINE_V0_3.md.

## Ambiente imersivo contextual
Geometria do escritório do kairos-os extraída como módulo Three.js sem seus loaders ou mocks e compartilhada com o World via OfficeGeometry. App escolhe departamento/câmera por ModuleKey; painel de vidro sobre fundo desfocado, com modo foco. ProductionProgress deriva progresso dos providers reais locais. EmptyState reaproveitado do kairos-command. Fontes em docs/REUSE_PROVENANCE.md; comportamento em docs/modules/IMMERSIVE_WORKSPACE.md.

## Correção do organograma — Kairos OS
Importados os 15 papéis do cadastro data/agents/agents.json do Kairos OS; CEO mapeado para ORION, WhatsApp para KAIROS, Hunter para Hunter AI, preservando sourceId. Acrescentados 12 papéis/especializações documentados no Blueprint e adendos. Total: 27 configurações, não 27 executores ativos.

A nova página Agentes contém busca, departamento, responsabilidades, indicador-alvo, origem, vínculo hierárquico e acesso ao painel relacionado. Os quatro modelos de reunião são exibidos como propostas de agenda, sem automação. Nenhum saldo, cliente ou token foi importado.

Dashboard e World usam o mesmo cadastro operacional. O Dashboard resume seis agentes e oferece acesso explícito ao organograma completo. O World instancia os 27, exibe balão apenas na seleção/hover para reduzir sobreposição e permite selecionar qualquer agente pelo nome. Fechar o inspetor agora oculta o painel.

O código do motor/importador existente na origem é evidência de implementação, não prova de conexão com este Core. Os executores continuam desconectados. A hierarquia dos 15 papéis originais responde a ORION; vínculos dos especialistas dos adendos são organização adotada neste Core, não importação literal do organograma original.

## Incremento Missão 004 — Video Engine local
`src/engines/video` implementa uma estação de trabalho no navegador. Arquivos reais entram por seleção local e permanecem em memória; Canvas compõe enquadramento, marca e logo, Web Audio mistura áudio original e música, e MediaRecorder produz WebM para download. `renderPlan.ts` concentra limites, dimensões, nomes seguros e negociação de codec.

O histórico em `localStorage` contém metadados da execução. A galeria em IndexedDB armazena os blobs concluídos por origem do navegador e permite reproduzir, baixar ou remover após recarregar. Falhas de cota não convertem um render real em resultado fictício: o arquivo temporário permanece disponível para download imediato. Google Flow, Higgsfield, Kling, Runway e Pika permanecem adaptadores desconectados. O pipeline FFmpeg do `kairos3` serviu como referência de capacidades e limites, mas não foi executado nem acoplado à Vercel.

Após validação do Founder, `storyboard.ts` passou a compilar roteiro em cenas determinísticas e `motionRenderer.ts` gera frames e trilha diretamente em Canvas/Web Audio. `VideoGenerator` é o fluxo principal; o renderizador de arquivos permanece como pós-produção. A geração nativa cria motion graphics, sem afirmar síntese fotorealista ou uso de modelos externos.
## Money Hunter v0.1

`src/features/hunter/HunterPage.tsx` é uma superfície local de operação comercial. Ela aceita apenas oportunidades que já foram observadas em fonte autorizada e mantém o estado no navegador. Não realiza coleta externa, automação de login, comunicação com clientes, nem envia propostas. Uma integração futura deve persistir dados no servidor, guardar prova de origem e manter aprovação explícita antes de qualquer ação externa.

## Migração do runtime KAIROS

A VPS do agente é uma dependência externa isolada da Vercel e do Supabase. A troca usa paralelismo: inventário sem segredos, réplica endurecida, reconexão oficial do WhatsApp, validação e sobreposição antes do desligamento da origem. O Core não recebe credenciais, sessões ou histórico da instância. Ver `docs/modules/KAIROS_VPS_MIGRATION.md`.

## Kit reutilizável do agente KAIROS

`templates/kairos-agent-kit` é uma fonte pública de contratos TypeScript para novas instalações. `scripts/export-kairos-agent-kit.sh` acrescenta o código auditável de uma origem sem sessões, credenciais, bancos, mídia e logs. A fronteira entre `config`, `core`, `tenancy`, `audit` e `skills` evita que o runtime de um cliente seja copiado como se fosse outro. O Core não executa esse exportador nem recebe seu resultado; a operação ocorre somente no servidor de origem e exige varredura antes de um push público.

## Money Hunter persistente

A Central de Demandas retém oportunidades registradas pelo Founder entre recargas no mesmo navegador. Os contratos de domínio e armazenamento deixam explícito que se trata de estado local, não CRM ou prova de execução. A integração com uma fonte, um banco ou um canal de comunicação permanece fora desta fase.

## Incremento — Money Lab, Analytics e descoberta

- `src/features/analytics` é uma camada de visualização de `useBusinessMetrics` e `useFleetStatus`; não cria fonte paralela de receita ou frota.
- `src/features/moneylab` consome a fila local do Hunter como sinal comercial, separado de dados financeiros do servidor.
- `api/_freelancerDiscovery.js` é um adaptador somente leitura configurado por ambiente. `api/hunter.mjs` mantém o mesmo Basic Auth das rotas operacionais. Nenhuma credencial vai ao browser.

## Runtime comercial v0.1

`src/engines/commercial/runtime.ts` concentra a máquina de estados de execução comercial. Adaptadores não podem declarar envio concluído sem `remoteId`; falhas de acesso entram como `paused_auth` por canal. Documento: `docs/modules/COMMERCIAL_RUNTIME_V0_1.md`.

## Ledger comercial e execução visível

- `command.commercial_runs` é a fonte planejada de persistência de ciclos comerciais; a migration 0026 deve ser aplicada antes de usar o endpoint em produção.
- A interface Hunter mostra o estado retornado pelo servidor e mantém os registros locais separados de execuções persistidas.
- A consolidação em `api/hunter.mjs` preserva o plano gratuito da Vercel dentro do limite de funções.

## Incremento — Character Bible e press kit

A Clone Engine inclui uma Character Bible local para continuidade de personagens: referências obrigatórias do press kit, universo, papel, invariantes visuais, figurino e direitos. A estrutura aceita referências a material do Founder mediante autorização, mas não implementa upload, treinamento ou síntese biométrica. Arquivos privados continuam fora do Git e requerem armazenamento privado antes de qualquer integração de geração.

## 2026-09-23 — Navegação de criação separada

Clone, Personagens e Biblioteca de filmes foram separados em superfícies próprias para evitar mistura entre biometria autorizada do Founder, continuidade ficcional e acervo de mídia local.

## 2026-09-23 — Série e continuidade do Founder

Foi adotado um fluxo de produção cinematográfica controlada: blockout 3D, referências de personagem e cenário, cenas curtas e montagem. A série original “Kairos: A Hora Certa” usa o Founder somente com referências autorizadas armazenadas em área privada e sem prometer resultados financeiros.

A Biblioteca de filmes separa galeria local IndexedDB de acervo operacional `command.content_assets`. O pipeline Seedance pode criar o primeiro establishing shot diretamente de texto para uma ideia aprovada, mantendo o press kit do Founder fora desse caminho. Modelos, uso e URLs são derivados do registro do servidor; a interface não inventa custo nem disponibilidade.

## Narrativa audiovisual e referências privadas

A série é definida em `docs/series/KAIROS_SIGNAL_TRILOGY_V0_1.md`. Ela não é uma fonte de dados operacionais: roteiro, storyboard e prompt são documentos de criação. Um resultado de geração só entra em `command.content_assets` depois de uma resposta verificável do provider, com metadados de modelo/uso.

O programa `docs/series/CHARACTER_PRESS_KIT_PROGRAM_V0_1.md` define as folhas de referência e uma fronteira de privacidade: bíblias de KAIROS/ORION podem ser públicas e abstratas; pessoas reais ficam em `memory/private` e requerem consentimento e autorização de destino antes de envio externo. A Biblioteca de filmes não contém press kits.

## Verificação de migrations do Content Engine

As migrations canônicas vivem em `C:\Users\Matheus\kairos-command\supabase\migrations\0020_content_engine.sql` e `0022_content_assets_bucket.sql`. Registros de sessão anteriores afirmam que foram aplicadas, mas há comentários legados que as chamam de pendentes. Antes de rodar SQL, o operador deve consultar `command.content_jobs`, `command.content_assets` e `storage.buckets(id='content-assets')`; só ausências confirmadas justificam reaplicar os scripts idempotentes.
