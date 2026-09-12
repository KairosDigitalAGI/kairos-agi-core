# Kairos AGI — protocolo de engenharia

Antes de cada missão, ler `docs/context/MASTER_CONTEXT.md`, `docs/context/CHANGELOG.md`, `docs/context/MISSION_QUEUE.md`, `KAIROS_AGI_BLUEPRINT_V1.md` e `ARCHITECTURE.md`.

Evoluir o projeto existente em TypeScript; reutilizar Core, Features, Engines, World, UI e tipos. KAIROS é o robô do Founder; Arthur pertence ao contexto de cliente. ORB significa Operational Runtime Beacon, hardware futuro fora do escopo atual.

Ao concluir uma missão: atualizar contexto, changelog, fila, arquitetura, README e documentação do módulo. Registrar mudanças do Blueprint em docs/BLUEPRINT_EVOLUTION.md. Não remover os documentos de contexto e blueprint; versionar suas evoluções. Informar resultado técnico, arquivos principais, limites, testes, próxima missão e commit.

Trabalhar em planos gratuitos. Não conectar APIs, publicar em redes sociais, contratar serviços ou introduzir despesas sem autorização correspondente. Credenciais e clientes identificados nunca entram em documentação pública. Usar CLIENT_001 etc.

Estado editorial compartilhado no EditorialProvider; regras em engines/instagram/domain.ts. World e Dashboard consomem useFounderAgents. Não duplicar essas regras nos componentes.

Validação da engine: `npm test` (Node 24) e `npm run build`. Dados locais não constituem Vault, autenticação ou auditoria inviolável.


## Adendo V1.1 e escopo atual
Ler também KAIROS_MEMORY_SYNC_V1_1.md. Missões 003 e 004 foram autorizadas e entregues. A fila 005–010 segue condicionada à autorização do Founder e aos acessos correspondentes.

Usar somente dados reais cadastrados ou consultados em fonte autorizada. Dado externo desconhecido = indisponível, nunca zero estimado, receita inventada ou agente fingindo trabalhar. Configuração de um papel não comprova execução. Não importar dados privados de clientes para o repositório público.

## Papéis oficiais
| Papel | Responsabilidade | Limite |
| --- | --- | --- |
| ORION | Priorizar missões, coordenar Dispatcher e usar Score Kairos | Não confundir metas com receita realizada; orçamento zero |
| KAIROS | Assistente pessoal do Founder, CRM e agenda | Arthur é agente de cliente, nunca infraestrutura Founder |
| Money Hunter | Inteligência de oportunidades: Trend, Content, Business, Tool Hunter e Opportunity Builder | Pesquisa contínua é arquitetura futura; nada publica sem aprovação |
| Instagram AI | Conteúdo, calendário, revisão e métricas verificadas | Só usa fontes conectadas; sem publicação automática |
| Hunter AI | Prospecção e qualificação para CRM | Isolar tenant, fonte e consentimentos; sem disparos nesta missão |
| Clone AI | Identidade autorizada, referências de voz/rosto, produção e revisão | Não gera nem clona mídia na Missão 003 |
| Video AI | Geração motion por roteiro, pós-produção local e adaptadores externos | Render local WebM custa zero; integrações externas continuam desligadas |
| QA AI | Validar regras, regressões, integridade dos dados e entregas | Relatar limites e falhas sem inventar verificações |
| Vault AI | Contratos de referências seguras a credenciais | Vault vazio, sem valores secretos no frontend |
| Shield AI | Isolamento, políticas, eventos e prevenção de vazamentos | Sem mudanças em outros projetos ou processos ativos |

Os papéis acima são definições do produto, não processos em execução nem autorização para criar agentes em segundo plano.

O roteador de mídia pode usar cotas gratuitas legítimas de provedores conectados e deve pausar cada provedor quando o saldo terminar. Não criar, armazenar ou alternar contas para contornar limites, créditos, planos ou termos de serviço. O fallback permanente de custo zero é o render local.

## Adendo visual do Founder — 11/09/2026
Reutilizar componentes comprovados dos repositórios existentes. Dashboard 2D em vidro sobre o escritório 3D contextual ao departamento. Progresso visual sempre derivado de ações reais, sem receita fictícia ou promessas de retorno. Registrar fontes/commits em docs/REUSE_PROVENANCE.md.

## Correção do organograma — Kairos OS
Importados os 15 papéis do cadastro data/agents/agents.json do Kairos OS; CEO mapeado para ORION, WhatsApp para KAIROS, Hunter para Hunter AI, preservando sourceId. Acrescentados 12 papéis/especializações documentados no Blueprint e adendos. Total: 27 configurações, não 27 executores ativos.

A nova página Agentes contém busca, departamento, responsabilidades, indicador-alvo, origem, vínculo hierárquico e acesso ao painel relacionado. Os quatro modelos de reunião são exibidos como propostas de agenda, sem automação. Nenhum saldo, cliente ou token foi importado.

Dashboard e World usam o mesmo cadastro operacional. O Dashboard resume seis agentes e oferece acesso explícito ao organograma completo. O World instancia os 27, exibe balão apenas na seleção/hover para reduzir sobreposição e permite selecionar qualquer agente pelo nome. Fechar o inspetor agora oculta o painel.

O código do motor/importador existente na origem é evidência de implementação, não prova de conexão com este Core. Os executores continuam desconectados. A hierarquia dos 15 papéis originais responde a ORION; vínculos dos especialistas dos adendos são organização adotada neste Core, não importação literal do organograma original.
