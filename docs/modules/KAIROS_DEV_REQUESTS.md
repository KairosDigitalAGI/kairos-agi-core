# Fila de evolução do KAIROS

A fila transforma uma necessidade observada no WhatsApp em trabalho técnico rastreável no Kairos AGI.

Estados: `awaiting_confirmation` → `pending` → `triaged` → `in_progress` → `done`. `blocked`, `error` e `rejected` encerram ou suspendem o fluxo com justificativa visível.

Cada transição gera um evento append-only em `command.dev_request_events`. Eventos com `notify_founder=true` são consultados pela ponte da VPS e enviados ao chat privado do Founder. O evento só recebe `delivered_at` após o transporte concluir.

O desenho separa três responsabilidades: KAIROS detecta e descreve a necessidade; o Founder confirma a alteração; Codex ou Claude Code analisa e implementa. Nenhum texto vindo do WhatsApp vira código executável diretamente.

O schema está na migration `0026_kairos_crm_dev_queue.sql` do repositório `kairos-command`.
