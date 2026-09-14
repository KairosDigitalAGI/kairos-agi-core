# Contexto operacional — 11/09/2026

Constituição: KAIROS_AGI_BLUEPRINT_V1.md. Adendos: KAIROS_MEMORY_SYNC_V1.md e KAIROS_MEMORY_SYNC_V1_1.md. AGENTS.md define papéis. Não reiniciar a arquitetura.

## Estado atual
- Missão 003 implementada como arquitetura operacional local: oito módulos Clone, Content Brain, pipeline e aprovação versionada. Nenhum serviço externo conectado.
- Dados demonstrativos removidos da interface. Receita, CRM, Coins e métricas externas indisponíveis até conexão real. Contadores editoriais/Clone vêm de registros do navegador.
- Instagram oficial informado: `_kairosdigital_`. Sem autenticação Meta, sem métricas consultadas.
- Clone: `kairos.clone.v1`; editorial: `kairos.editorial.real.v1`. Acervo demonstrativo antigo preservado na chave anterior, fora da interface.
- KAIROS é robô do Founder; Arthur e memórias de cliente continuam isolados.
- Adendo V1.1 inclui Money Hunter, Score Kairos e Ideas Vault como arquitetura futura. Papéis configurados não significam agentes executando.
- Triagem do GitHub: 49 repositórios acessíveis inventariados; metadados, árvores e documentos técnicos selecionados. Não é auditoria integral nem validação de serviços em produção. Relatório detalhado fica em memory/private/repository-audit/REPOSITORY_COMPOSITION.md, fora do Git público.
- Clone não gera voz, rosto, imagem nem vídeo. VideoProvider preparado e desligado. Client Edition não ativada. Vault vazio.
- Nenhuma despesa contratada; outros repositórios e processos de produção não alterados.
- Missão 004: Video Engine cria motion videos do zero a partir de roteiro e também edita vídeo real local. Storyboard, animação, marca, trilha, corte e download WebM rodam no navegador; arquivos e roteiro não são enviados a servidor.
- Integration Control Plane: página e endpoint server-side verificam configuração de Meta, Google, X e do futuro token store. Nenhuma credencial ou conta está conectada ainda.

## Consolidação Kairos — 14/09/2026
Founder autorizou consolidar kairos-command, kairos-os e kairos-agi-core num único braço operacional ("usar o que já tem, e se não tiver, criar"). Este Core segue como base (decisão registrada em docs/REUSE_PROVENANCE.md e docs/REPOSITORY_REUSE_STRATEGY.md). Arthur é bot de cliente (Allfix), fora de escopo; KAIROS é o agente WhatsApp pessoal do Founder (`62981554992`, pm2 `kairos`, VPS 2.24.199.205).

Missão 006, Fase 1 entregue: Dashboard lê receita do mês, receita total, MRR e clientes ativos/total do Supabase mestre (schema `command`, mesmo banco do kairos-command) via `api/business-metrics.mjs`; frota de agentes WhatsApp e alertas críticos via `api/agent-status.mjs`. Ambas as rotas são server-side, só leitura, atrás de Basic Auth própria deste projeto e desbloqueadas por sessão. Nenhuma migration/RLS de origem alterada.

Missão 006, Fase 2 entregue: chat consultivo com qualquer um dos 27 agentes do organograma (`AgentsPage` → botão "Conversar"), provider de LLM trocável em `api/_providers/` — Anthropic e OpenAI (planos pagos do Founder) primeiro, OpenRouter só reserva de último caso, nunca default. Nenhum agente tem executor conectado; o chat nunca finge ter agido. Mesma Basic Auth do Painel Operacional. Próximas fases planejadas: consolidação do Hunter Skill e Content Engine (Supabase `content_jobs`/`content_assets`/`content_calendar`/`avatars`/`prompt_library`).

## Próxima missão
Missão 005 (KAIROS WhatsApp) permanece planejada. Exige mapear a instância real e seu acesso antes de conectar o Core, sem interromper o processo atual. Ver docs/modules/VIDEO_ENGINE_V0_4.md.

## Adendo visual
Painel transparente sobre escritório 3D contextual, reaproveitado do kairos-os. EmptyState adaptado do kairos-command. Progresso ligado aos registros locais e às aprovações; sem atividade ou ganhos fictícios. Não representa World 0.2 completo.

## Correção do organograma — Kairos OS
Importados os 15 papéis do cadastro data/agents/agents.json do Kairos OS; CEO mapeado para ORION, WhatsApp para KAIROS, Hunter para Hunter AI, preservando sourceId. Acrescentados 12 papéis/especializações documentados no Blueprint e adendos. Total: 27 configurações, não 27 executores ativos.

A nova página Agentes contém busca, departamento, responsabilidades, indicador-alvo, origem, vínculo hierárquico e acesso ao painel relacionado. Os quatro modelos de reunião são exibidos como propostas de agenda, sem automação. Nenhum saldo, cliente ou token foi importado.

Dashboard e World usam o mesmo cadastro operacional. O Dashboard resume seis agentes e oferece acesso explícito ao organograma completo. O World instancia os 27, exibe balão apenas na seleção/hover para reduzir sobreposição e permite selecionar qualquer agente pelo nome. Fechar o inspetor agora oculta o painel.

O código do motor/importador existente na origem é evidência de implementação, não prova de conexão com este Core. Os executores continuam desconectados. A hierarquia dos 15 papéis originais responde a ORION; vínculos dos especialistas dos adendos são organização adotada neste Core, não importação literal do organograma original.
