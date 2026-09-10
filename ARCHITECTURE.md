# Arquitetura — proposta inicial

## Camadas

1. **Interface**: Dashboard Kairos OS em `apps/`. A página inicial está hospedada na Vercel Hobby; o dashboard funcional ainda será implementado.
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

## Ambientes

Development: dados sintéticos e credenciais próprias. Production: configuração separada, domínio e acesso revisados. A Vercel usa `main` para produção e cria deployments automaticamente a partir do GitHub; previews devem usar variáveis próprias. Nenhum segredo de servidor deve ser entregue ao navegador.

## Não implementado nesta fundação

Framework, endpoints, migrações SQL, autenticação, filas, integrações e deploy. A seleção e implementação fazem parte do roadmap. Não existe sincronização automática entre arquivos locais e fontes do ChatGPT.
