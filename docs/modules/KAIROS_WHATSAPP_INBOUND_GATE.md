# KAIROS WhatsApp — gate de inbound

## Objetivo

Impedir que o robô no WhatsApp pessoal do Founder responda mensagens sociais ou contatos sem relação comercial, mesmo quando esses números já aparecem no histórico local.

## Regra operacional

Uma resposta automática só é permitida quando o registro possui tipo `prospecto`, `site`, `x1` ou `simulacao`, ou quando já há reunião confirmada ou venda registrada. `inbound`, `equipe`, `parceiro`, contato sem cadastro e contato conhecido apenas por histórico permanecem silenciosos.

O gate falha fechado. Enquanto o CRM não estiver carregado ou se a classificação lançar erro, nenhuma resposta é enviada. Matheus e Vilson conservam seus canais operacionais autenticados.

O bloqueio temporário do detector de loop também é reavaliado a cada nova mensagem. Uma resposta posterior com sinal humano ou intenção comercial limpa o falso positivo e recoloca o lead explícito no atendimento; mensagens automáticas continuam bloqueadas. Essa regra evita perder uma venda porque uma saudação automática respondeu rápido demais.

## Identidade

Nas conversas comerciais autorizadas, o agente se apresenta como **KAIROS**, agente autônomo pessoal do Matheus e da Kairos Digital. O runtime não usa “Caio” nem apresenta um assistente diferente a números desconhecidos.

## Artefatos e verificação

- `ops/kairos-whatsapp/inboundPolicy.cjs`: política pura e testável.
- `ops/kairos-whatsapp/inbound-lead-only.patch`: alterações aplicadas ao runtime privado, sem credenciais ou dados de contato.
- `tests/kairosInboundPolicy.test.mjs`: cobre lead explícito, contato pessoal com histórico, equipe, estado avançado sem origem e falha fechada.

O runtime foi reiniciado na VPS e confirmou conexão. A política passou por seis cenários isolados. Depois da classificação explícita do Founder, `CLIENT_001` foi recuperado do falso bloqueio, recebeu uma retomada personalizada e a entrega foi confirmada remotamente no chat do WhatsApp. Nenhum dado identificador do contato integra este repositório.

