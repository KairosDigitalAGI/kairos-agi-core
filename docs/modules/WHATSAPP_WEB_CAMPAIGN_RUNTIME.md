# Runtime de campanha WhatsApp Web

## Estado em 01/10/2026

O KAIROS da VPS mantém uma sessão WhatsApp Web pareada. Por autorização explícita do Founder, uma rota de campanha isolada foi programada para iniciar diariamente às 07h no fuso `America/Sao_Paulo`, com teto de 30 primeiras abordagens por dia.

Às 22h o Hunter mede a reserva do CRM e busca novos leads até o alvo de 45 elegíveis. Se a reserva continuar abaixo do alvo, a política de recuperação alterna nichos e cidades e repete a tentativa às 00h30 e 04h30. Cada incidente e estratégia aplicada é registrado no runtime privado. A intervenção do Founder fica reservada para falhas finais que o ciclo não conseguiu resolver.

Essa rota não abre o freio global do bot. `OUTBOUND_ENABLED` permanece desativado, evitando que campanhas antigas, follow-ups legados e outros caminhos de saída sejam liberados juntos. O runtime privado seleciona apenas registros Hunter ainda não contatados, em estado inicial, com score igual ou superior a 45.

## Regras da campanha

- uma primeira abordagem por empresa;
- identificação explícita do KAIROS como assistente digital da Kairos Digital;
- personalização por empresa, nicho, cidade e sinal público disponível;
- opt-out textual com a palavra `SAIR`;
- teto de 30 contatos por dia;
- intervalo técnico fixo entre contatos;
- confirmação no próprio chat antes de registrar entrega;
- interrupção da fila quando o envio fica indeterminado, sem repetição cega;
- comando privado `/campanha-parar` desativa a rotina; `/campanha-status` consulta o resumo.
- modo `KAIROS_FREE_ONLY=true`, que bloqueia chamadas externas de LLM e usa respostas locais no atendimento;
- coleta noturna via Google Maps público, sem API paga; Facebook Ads fica desligado nesse ciclo.

## Capacidade e limites

Às 03:05 de 01/10/2026 havia 33 empresas elegíveis para o primeiro dia, sendo 30 para a meta e três de reserva. Isso é um snapshot, não garantia permanente. O Hunter roda às 08h, 13h e 18h para recompor a reserva do dia seguinte, mas a quantidade aprovada depende dos dados reais encontrados, da validade dos números e do score. O sistema não inventa leads nem reduz silenciosamente o critério para preencher a meta.

WhatsApp Web não equivale à WhatsApp Business Platform oficial. A sessão está sujeita a desconexão, limitação ou bloqueio pela plataforma. A interface deve apresentar essa limitação e nunca afirmar risco zero.

O custo incremental das rotinas descritas aqui é zero. Elas reutilizam a VPS existente, regras locais e coleta pública. Nenhum crédito, plano ou API paga foi ativado.

## Fronteira de dados

Telefones, nomes de empresas, sessão do navegador, logs de entrega e o arquivo privado da campanha permanecem na VPS. Nenhum desses dados entra no repositório público ou no frontend. O Core hospedado mostra apenas o snapshot agregado e o status da frota autenticada.
