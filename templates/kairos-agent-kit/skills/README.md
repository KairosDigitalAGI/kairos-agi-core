# Skill contracts

Cada skill é uma capacidade instalada por tenant. O catálogo define intenção; a implementação deve validar o tenant, registrar eventos de auditoria e aplicar a política de aprovação.

| Skill | Entrada | Saída | Regra operacional |
| --- | --- | --- | --- |
| `whatsapp-gateway` | evento oficial do canal | `AgentEvent` | Sessão e webhook pertencem a uma única instalação. |
| `llm-router` | pedido sanitizado | rascunho | Provedor, modelo e orçamento são definidos por tenant. |
| `lead-intelligence` | oportunidade de fonte autorizada | qualificação | Não raspa plataformas nem envia contatos sem aprovação. |
| `content-ops` | briefing aprovado | ativo ou rascunho | Publicação continua uma ação aprovada. |
| `memory-state` | evento e política | estado isolado | Sem mistura de clientes, retenção explícita. |