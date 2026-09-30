# Skills do Kairos Agent Kit

Cada skill é instalada por cliente com configuração própria. Esta pasta guarda apenas contratos e documentação, nunca tokens, histórico ou sessões.

- `whatsapp-gateway`: recebe eventos oficiais, valida origem, produz respostas conforme regras aprovadas e registra auditoria isolada.
- `llm-router`: seleciona o provedor configurado para aquele cliente, aplica orçamento, timeout e fallback explícito.
- `lead-intelligence`: organiza oportunidades recebidas por fontes permitidas; não contorna limites nem dispara contatos sem aprovação.
- `content-ops`: produz e revisa ativos mediante aprovação; publicação requer autorização por ativo.
- `memory-state`: armazena memória e estado por tenant, com retenção definida por contrato.
## Estrutura de implementação

O template instala cada skill atrás dos mesmos contratos, em vez de copiar lógica entre agentes:

```text
src/config/     configuração sem valores secretos
src/core/       AgentEvent, AgentResponse e AgentSkill
src/tenancy/    validação de tenant e canais permitidos
src/audit/      referência auditável de execução
src/skills/     catálogo e habilitação de capacidades
```

A tabela abaixo define o que cada capacidade pode fazer numa instalação nova:

| Skill | Pode fazer | Não pode fazer |
| --- | --- | --- |
| `whatsapp-gateway` | adaptar evento vindo de conexão oficial da própria instalação | reutilizar sessão, QR ou conversa de outro tenant |
| `llm-router` | produzir rascunho com provedor/modelo configurados | ocultar custo, trocar credenciais ou executar sem limites |
| `lead-intelligence` | classificar demanda trazida de uma fonte permitida | raspar, burlar limites ou enviar proposta automaticamente |
| `content-ops` | criar briefing, texto e ativo para revisão | publicar ou prometer resultado sem aprovação |
| `memory-state` | persistir estado isolado sob política declarada | misturar dados, histórico ou perfil entre clientes |

Toda implementação concreta deve chamar `assertTenant` antes de processar um evento e registrar referências no contrato `AuditWriter` sem transportar conteúdo sensível.

## Estado operacional verificado em 30/09/2026

- WhatsApp pareado na VPS e evento `ready` confirmado.
- PM2 executa `kairos` e `kairos-heartbeat`; watchdog externo restaurado.
- Chromium usa `/tmp` como diretório temporário estável.
- Hunter coleta diariamente até 30 prospects qualificados às 07h, com 15 vagas por cidade, deduplicação e score mínimo.
- A coleta é separada da comunicação: resultados ficam em revisão e `OUTBOUND_ENABLED=false` bloqueia prospecção fria.
- O gate permite resposta apenas após inbound fresco, dentro da janela definida pelo runtime, ou para contato monitorado explicitamente.
- Workana e 99Freelas não estão conectados a este agente. Cada plataforma requer conector próprio com prova de envio e escopo de autorização.

## Superfície Carlos AGI

A página Carlos AGI reúne o sinal autenticado da frota, a rotina de descoberta e os handoffs do Founder. Ela não altera o gate de saída do runtime. O teste proprietário confirma o caminho técnico de envio ao dono da conta; ele não valida campanha, consentimento de terceiros ou integração oficial da Meta.
