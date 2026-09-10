# Dados

Supabase será a camada persistente na Missão 005 após definição de tenancy, RLS, eventos e contratos de OS. Hoje apenas dados editoriais usam localStorage versionado e validado. Não é banco compartilhado, backup, Vault nem sincronização. A migração deverá preservar IDs, revisão de conteúdo e decisão aprovada; não importar flags de aprovação do cliente como autorização confiável de servidor.
