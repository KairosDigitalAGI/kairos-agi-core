# Evolução do Blueprint

## 2026-09-11 — Video Engine profissional
Video AI passa a planejar cada criativo a partir de oferta, público, promessa verificável, prova e chamada para ação. O pipeline oficial é: briefing, roteiro, frames de referência, cenas generativas, composição, QA, galeria, aprovação e distribuição. Cada execução externa deverá registrar provedor, modelo, estimativa, custo real, artefatos e aprovação.

A estratégia inicial reduz integrações usando a API da Runway como gateway de múltiplos modelos. O render local continua como alternativa de custo zero. YouTube e TikTok são destinos planejados e exigem OAuth, backend e consentimento antes do envio. Monetização é objetivo de negócio, não dado presumido: receita só entra no Core quando vier de fonte conectada e auditável.

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
