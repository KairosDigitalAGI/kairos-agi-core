# KAIROS CRM — auditoria do WhatsApp

## Entrega

O runtime privado do KAIROS registra eventos comerciais em uma fila local append-only e sincroniza lotes para `command.crm_events` no Supabase mestre. A tabela usa RLS sem policy para `anon` ou `authenticated`; somente `service_role` lê e insere.

Cada evento referencia o hash `source_ref` do lead, nunca repete o telefone. A trilha cobre classificação, mensagem recebida, mensagem enviada, confirmação remota, bloqueio, retomada, etapa, score, reunião e erro. Conteúdo textual é limitado a 1.200 caracteres e metadados são normalizados pelo Core.

## Interface

A página CRM mostra contadores de eventos, entregas, bloqueios, retomadas e falhas. Cada lead abre uma linha do tempo própria. A consulta privada é renovada a cada 15 segundos e também possui atualização manual.

## Transporte e recuperação

Eventos ficam em `data/crm-events.jsonl` na VPS até o Core confirmar a persistência. Falha de rede ou indisponibilidade do Supabase conserva a fila para a próxima sincronização; o runtime não apaga eventos antes da confirmação HTTP.

Migration: `kairos-command/supabase/migrations/0027_kairos_crm_events.sql`.

## Validação operacional — 01/10/2026

Uma conversa comercial já confirmada nos logs do runtime foi reconstruída na auditoria sem inventar atividade: retomada entregue, resposta inbound sobre organização do WhatsApp, opções de horário entregues, escolha de horário e reunião registrada. O Core passou a expor seis eventos no total, duas entregas confirmadas e zero falhas. O backfill foi marcado como evidência histórica do log; novas mensagens entram pela instrumentação ativa do runtime.
