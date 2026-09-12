# Arquitetura — proposta inicial

## Evolução da Video Engine
`providerCatalog.ts` mantém capacidades, unidade de cobrança, preço em USD, fonte e data de verificação. `ProductionPlanner` transforma somente os campos informados pelo Founder em roteiro e calcula o orçamento antes de gerar. O provedor local é executável; todos os modelos pagos ficam desconectados até existir adaptador server-side, segredo no Vault e limite de orçamento.

`distribution.ts` registra YouTube e TikTok como destinos desconectados. A publicação futura passa por backend autenticado, armazenamento privado de tokens, aprovação por ativo e consulta do status remoto. Nenhum segredo, OAuth ou chamada de publicação vive no frontend público.

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
