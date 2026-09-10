# Backlog inicial — Dashboard Kairos OS

Todos os itens estão em **A fazer**. Prioridades são uma proposta inicial.

| ID | Prioridade | Módulo | Entrega | Critério de aceite | Dependência |
| --- | --- | --- | --- | --- | --- |
| OS-001 | P0 | Base | Login e navegação dos oito módulos | Usuário autenticado vê módulos; acesso não autorizado é negado | Supabase e framework |
| OS-002 | P0 | Base | Tarefas, execuções e auditoria | Cada execução tem origem, estado, histórico e responsável | Modelo de dados |
| OS-003 | P0 | Infraestrutura | Painel de integrações | Exibe conectado, pendente ou erro com última verificação; não exibe segredos | Conectores |
| OS-004 | P0 | Base | Aprovações e limites | Ações restritas aguardam aprovação válida e respeitam orçamento | OS-002 |
| OS-101 | P1 | Hunter | Pipeline de leads | Criar, deduplicar e mover leads entre etapas, com fonte registrada | OS-001 e autorização de dados |
| OS-201 | P1 | Carlos WhatsApp AI | Atendimento e transferência humana | Conversa de teste recebida, resposta auditada e transferência funcionando | Provedor WhatsApp aprovado |
| OS-301 | P2 | Kairos Ads | Planejamento e métricas | Campanhas em rascunho e métricas de leitura; gasto depende de aprovação | Conta de anúncios |
| OS-401 | P2 | Site Maker | Briefing e preview de sites | Briefing gera versão revisável e link de preview | Pipeline Vercel |
| OS-501 | P1 | ORB | Definição de escopo | Responsável aprova significado, usuários, entradas, saídas e métricas | Descoberta com Matheus |
| OS-601 | P2 | Financeiro | Receitas, despesas e visão de caixa | Totais conciliáveis com registros e trilha de alterações | Modelo financeiro aprovado |
| OS-701 | P2 | Conteúdo | Calendário editorial | Pauta passa por rascunho, revisão e aprovação; publica só com autorização | Modelo editorial |
| OS-801 | P1 | Infraestrutura | Saúde, logs e custos | Mostra falhas, última execução e consumo por integração | OS-002 e OS-003 |

## Sequência proposta

Base e infraestrutura → Hunter → Carlos WhatsApp AI → expansão dos módulos. ORB permanece em descoberta; nenhum significado foi presumido.
