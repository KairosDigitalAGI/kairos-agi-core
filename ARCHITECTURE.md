# Arquitetura — proposta inicial

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
- `ORB` permanece em descoberta porque o Blueprint V1 não define seu significado.
- Os módulos Hunter, Kairos Ads, Site Maker, Financeiro, Conteúdo e Infraestrutura serão relacionados às Engines e aos distritos correspondentes durante o detalhamento do V2.

## Ambientes

Development: dados sintéticos e credenciais próprias. Production: configuração separada, domínio e acesso revisados. A Vercel usa `main` para produção e cria deployments automaticamente a partir do GitHub; previews devem usar variáveis próprias. Nenhum segredo de servidor deve ser entregue ao navegador.

## Kairos Core v0.1

A Missão 001 estabelece uma aplicação cliente sem backend. `src/core` agrega o estado compartilhado; `src/types` define os contratos; `src/data/mock` é a única fonte dos dados demonstrativos. Dashboard, World, Tasks, CRM e Instagram consomem esses contratos sem integração externa.

O World 0.1 usa React Three Fiber e Drei. ORION, KAIROS, Instagram AI e Hunter AI são instâncias do mesmo tipo `FounderAgent`; o painel lateral e os balões leem a mesma coleção mockada. KAIROS é o robô pessoal do Founder. Arthur permanece fora da infraestrutura da Founder Edition.

O frontend usa divisão de código para carregar o pacote 3D apenas quando o usuário abre o World. Navegação e estado de Tasks existem apenas na sessão do navegador nesta versão.

## Não implementado no v0.1

Endpoints, persistência, autenticação, migrações SQL, filas, integrações com Instagram ou WhatsApp e armazenamento de credenciais. O Vault é apenas um placeholder seguro. Não existe sincronização automática entre arquivos locais e fontes do ChatGPT.
