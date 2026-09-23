# Kairos Agent Kit

Kit modular para criar uma instalação do agente KAIROS para um Founder ou cliente, sem transportar sessões de WhatsApp, bancos, conversas, mídia, tokens ou credenciais.

## Estrutura

- `apps/founder-agent/`: código do runtime exportado da VPS após a varredura sanitizada.
- `skills/`: contratos reutilizáveis por capacidade, sem dados de um cliente.
- `docs/`: operação, segurança e implantação.
- `.env.example`: nomes de configuração, sem valores.

## Regra de isolamento

Cada novo cliente recebe uma instalação, `.env`, banco, sessão de mensageria e logs próprios. Nunca copiar `node_modules`, `.wwebjs_auth*`, arquivos `.env`, SQLite/DB, backups, mídia, logs ou credenciais entre clientes.

## Exportar da VPS

No servidor que contém o runtime, execute:

```bash
bash /caminho/para/export-kairos-agent-kit.sh /root/kairos3 /root/kairos-agent-kit
```

O script não altera a origem. Ele exclui material operacional sensível e bloqueia a exportação se detectar um provável segredo literal. A revisão deve terminar antes de publicar o repositório.

## Publicação

Após a revisão:

```bash
cd /root/kairos-agent-kit
git init
git add .
git status
git commit -m "feat: bootstrap reusable kairos agent kit"
gh repo create KairosDigitalAGI/kairos-agent-kit --public --source=. --remote=origin --push
```

O repositório deve ser público somente quando o scanner estiver limpo e o `git status` não trouxer dados reais.
## Template de instalação

O repositório contém `templates/kairos-agent-kit/`, uma base TypeScript que é copiada para cada kit exportado. Ela define os limites entre configuração, contrato de evento, isolamento por tenant, auditoria e skills. O template é seguro para versionamento porque só contém valores `CHANGE_ME`.

A exportação da VPS copia o código auditável para `apps/founder-agent/` sem substituir os contratos do template. O resultado precisa passar pela varredura, revisão humana de `git status` e teste local antes de qualquer repositório público.

## Estado atual

O template e o exportador estão prontos neste Core. O runtime da VPS ainda não foi exportado nem publicado; pareamento e sessões de mensageria permanecem fora do kit por desenho.
