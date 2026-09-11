# Reaproveitamento do acervo — 11/09/2026

Inventariados 49 repositórios acessíveis na conta autorizada. O inventário e as evidências por commit estão em relatório privado local, fora do Git. A triagem examinou árvores, manifests e documentos selecionados; não executou serviços nem validou todos os projetos em produção.

## Composição adotada
- Preservar Core React/TypeScript e Blueprint existentes como camada de interação.
- Separar memória Markdown de telemetria operacional, seguindo o padrão encontrado no acervo.
- Usar catálogo → pipeline → aprovação por versão → adaptador de provedor. Troca de engine não deve alterar o restante da plataforma.
- Manter instâncias de cliente, memórias, bancos e processos de WhatsApp isolados. Nenhum dado privado será agregado ao bundle público.
- Reutilizar UI/3D de forma seletiva, sem levar junto autenticação frágil, dados demo, chaves ou acessos específicos de outro projeto.
- Reaproveitar contratos de leads/CRM/Ads e modelos de administração somente após validar identidade, tenant e origem dos dados.

## Vídeo e custo
Foi encontrado um pipeline com FFmpeg local, interpretação e transcrição externas. É candidato à Missão 004; executar esse pipeline integralmente não é automaticamente gratuito. A extração deverá isolar operações locais, validar arquivos e manter adaptadores pagos desligados. Missão 003 não gera mídia.

## Critério de aceitação
Código reutilizado precisa ter fonte/commit registrados, compatibilidade técnica, separação de dados privados, validação relevante e custo conhecido. README ou existência de uma rota não comprova integração ativa. Não fundir todos os repositórios num monólito; preservar contratos e a responsabilidade de cada módulo.
