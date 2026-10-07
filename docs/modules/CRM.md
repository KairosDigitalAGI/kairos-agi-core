# CRM KAIROS WhatsApp

O KAIROS AGI consulta a base comercial privada do runtime WhatsApp por uma ponte servidor-servidor. A VPS normaliza e envia lotes idempotentes para `command.crm_leads`; o navegador só recebe os registros depois do desbloqueio do Painel Operacional. Telefones aparecem mascarados por padrão e podem ser revelados individualmente pelo Founder.

## Fluxo

1. `ops/kairos-whatsapp/agiBridge.js` lê o banco privado da VPS, remove duplicidades pelo identificador estável e sincroniza lotes a cada dois minutos.
2. `POST /api/hunter?action=crm-sync` exige `CRM_SYNC_TOKEN`, normaliza os campos e faz upsert pelo par `source/source_ref`.
3. `GET /api/hunter?action=crm` exige a autenticação do Painel Operacional, pagina toda a base e calcula indicadores somente a partir dos registros retornados.
4. `CrmPage` oferece busca, filtro por etapa, métricas verificadas e revelação individual de telefone.

O repositório não contém telefones, credenciais, histórico de conversa ou nomes de clientes. Esses dados permanecem no runtime privado e no Supabase mestre com RLS; documentação usa apenas identificadores anônimos como `CLIENT_001`.

## Pedidos de evolução pelo WhatsApp

O Founder pode usar `/upgrade <descrição>` no chat privado do KAIROS. A demanda entra em `command.dev_requests` como `awaiting_confirmation` e retorna um código curto. Apenas `/confirmar <código>` libera a fila técnica. Codex ou Claude Code registra estados por `dev-update`; eventos pendentes voltam ao Founder pelo próprio WhatsApp e são marcados como entregues depois do envio.

Comandos disponíveis: `/upgrade`, `/confirmar` e `/devstatus`. A confirmação autoriza a triagem daquele pedido; ela não permite execução arbitrária de shell recebida pelo WhatsApp. Mudanças continuam sujeitas a revisão, testes e registro no Mapa do Projeto.

## Limites

- A memória persistente atual é o banco do runtime, o arquivo de memória executiva e o Supabase; uma sincronização Obsidian ao vivo ainda não foi comprovada.
- A ponte não treina um modelo. Ela conserva histórico, estado, evidência e fila de melhoria para evolução auditável.
- O transporte atual usa uma sessão WhatsApp Web privada e pode sofrer restrições do provedor.

## 07/10/2026 — ledger autenticado da operação comercial

O KAIROS AGI deixou de exibir o snapshot fixo de 01/10. A própria resposta autenticada de `GET /api/hunter?action=crm` agora inclui `runtime`, uma projeção calculada sobre leads e eventos sincronizados: elegíveis, contatados, sem WhatsApp, mensagens recebidas, mensagens de saída, entregas, bloqueios e falhas. A data exibida é a atividade sincronizada mais recente.

A projeção não comprova agenda, processo online ou execução futura. O status da frota continua sendo consultado separadamente. O ledger dos ciclos noturnos permanece pendente porque esses eventos ainda não chegam ao Core.
