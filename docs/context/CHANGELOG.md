# Changelog

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
