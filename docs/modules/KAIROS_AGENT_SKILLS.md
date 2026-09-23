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
