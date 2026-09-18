# Atendimento Instagram — comentários e Direct

Revisão de 18/09/2026: alterações que permitiam webhook sem segredo, LLM automática paga e token direto sem checar o ID da conta foram revertidas. A assinatura inválida continua retornando 403; problemas de configuração e persistência retornam erro em vez de fingir entrega. A efetiva chegada de eventos da Meta ainda precisa de teste real.

Incremento posterior: o teste isolado de “oi” do Founder com Gemini Flash-Lite foi preparado em [FOUNDER_GREETING_V0_1.md](FOUNDER_GREETING_V0_1.md). Continua desligado até verificar ID real do remetente, projeto Gemini Free Tier sem faturamento, assinatura da conta e entrega da Meta. Nenhuma LLM paga ou resposta geral a clientes foi ativada.

Incremento da Missão 006, 17/09/2026. Usa somente a Instagram API com Instagram Login da conta profissional conectada ao Core. Não há scraping, automação de navegador, troca de contas nem provedor pago.

## Contrato operacional

- `GET /api/integrations/instagram/webhook` responde ao challenge da Meta com `META_WEBHOOK_VERIFY_TOKEN`.
- `POST` no mesmo caminho valida `X-Hub-Signature-256` sobre o corpo bruto usando `META_APP_SECRET`, limita o payload e aceita apenas `object=instagram`.
- Comentários e DMs de texto geram eventos únicos em `command.instagram_engagement_events`. Ecos, anexos sem texto, outras contas e duplicatas são ignorados. Dados privados ficam no schema `command`, sem policy RLS pública.
- Regras nascem pausadas. O Founder revisa o texto literal e ativa uma regra de palavra-chave por canal no painel Instagram → Atendimento. Só regras com `approved_at` e `enabled=true` enviam respostas automáticas. Não há LLM nem gasto por geração.
- Direct automático exige mensagem iniciada pela pessoa nas últimas 24 horas. Há no máximo uma resposta automática por pessoa/canal/dia UTC. Resposta manual usa o mesmo intervalo do Direct.
- O envio passa por estado `pending → sending → sent`; falha ambígua vira `review`, sem retry automático. O identificador remoto e horário ficam registrados. Reenvio de webhook não duplica resposta.
- `GET inbox`, `POST rule`, `POST rule-toggle` e `POST reply` exigem Basic Auth do Painel Operacional. A tela nunca recebe o token da Meta.
- `GET webhook-subscription` consulta a assinatura da **conta** na Graph API; `POST subscribe-webhook` tenta assinar `comments,messages`. Token vai em header Bearer, não na URL. Assinatura da conta não comprova app publicado nem evento recebido.

## Ativação externa pendente

1. Aplicar `supabase/migrations/0025_instagram_engagement.sql` no **Supabase mestre da Kairos**, o mesmo que contém `command.integracoes_tokens`; verificar as três tabelas pelo backend. Não aplicar em outro projeto Supabase. A migration 0024 do Claude, em `docs/migrations`, criou tabelas legadas sem deduplicação e não é usada por este fluxo.
2. `META_WEBHOOK_VERIFY_TOKEN` já consta como variável criptografada de produção na Vercel. Verificar o challenge depois do novo deploy, sem registrar o valor no Git.
3. **Concluído:** no app Meta **Kairos AGI Core**, o callback `https://kairos-agi-core.vercel.app/api/integrations/instagram/webhook` foi salvo e somente `comments` e `messages` ficaram assinados. O challenge retornou 200 e um POST sem assinatura 403 na produção.
4. Publicar o app Meta após cadastrar política de privacidade e concluir a análise necessária para acesso ao vivo. A tela Meta informa que apps não publicados não recebem webhooks.
5. Enviar um comentário e um Direct a partir de uma conta de teste autorizada. Confirmar que chegam uma vez à fila, sem resposta automática; revisar um texto, criar/ativar a regra e repetir o teste com nova interação. Não usar clientes reais antes de confirmar o acesso avançado exigido pela Meta.

O app Meta permanece em modo de teste. O app acessível no painel é `Kairos AGI Core` (ID `1572077540519784`, Instagram App ID `1114179454878605`); o ID `2559962444448696` de uma instrução externa não apareceu nesta conta. A conexão OAuth da própria `_kairosdigital_` comprova o token, não comprova entrega de webhooks de usuários externos nem App Review. Até os testes ponta a ponta, o status é **implementado, não ativado**. A ausência da migration ou do verify token falha fechado.

## Privacidade e limites

O banco guarda até 2.000 caracteres de cada interação e IDs do Instagram para permitir atendimento e deduplicação. A retenção e exclusão desses dados precisam de uma política operacional antes de abrir o serviço para clientes. O estado `review` exige inspeção humana porque um timeout pode ter ocorrido após a Meta aceitar a resposta. A aplicação não promete resposta para anexos, stories, reações ou comentários sem texto.

Referências primárias: [Instagram API oficial da Meta no Postman](https://www.postman.com/meta/workspace/instagram/documentation/23987686-9386f468-7714-490f-9bfc-9442db5c8f00), [Send API da Meta](https://www.postman.com/meta/instagram/request/scob1z4/text-message).
