#!/usr/bin/env bash
# Exporta uma cópia auditável do runtime KAIROS para um kit reutilizável.
# Uso: ./scripts/export-kairos-agent-kit.sh /root/kairos3 /root/kairos-agent-kit
# Nunca altera a origem. A saída falha se encontrar um padrão provável de segredo.

set -euo pipefail
umask 077

source_dir="${1:?Informe o diretório-fonte do runtime KAIROS}"
target_dir="${2:?Informe o diretório de destino do kit}"
script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
template_dir="$script_dir/../templates/kairos-agent-kit"

if [[ ! -d "$source_dir" ]]; then
  echo "Fonte não encontrada: $source_dir" >&2
  exit 1
fi
if [[ -e "$target_dir" && -n "$(find "$target_dir" -mindepth 1 -maxdepth 1 -print -quit)" ]]; then
  echo "Destino já contém arquivos: $target_dir" >&2
  exit 1
fi

mkdir -p "$target_dir/apps/founder-agent"

# Inclui somente os contratos públicos do template, se ele estiver ao lado do script.
if [[ -d "$template_dir" ]]; then
  cp -R "$template_dir/." "$target_dir/"
fi

# Código e manifestos apenas. Sessões, bancos, mídias, cache, logs e chaves nunca entram.
excludes=(
  --exclude='.git/' --exclude='node_modules/'
  --exclude='.env' --exclude='.env.*'
  --exclude='.wwebjs_auth*/' --exclude='.wwebjs_cache/'
  --exclude='*.sqlite' --exclude='*.sqlite-*' --exclude='*.db' --exclude='*.db-*'
  --exclude='*.log' --exclude='logs/' --exclude='backups/'
  --exclude='google-credentials.json' --exclude='*credentials*.json'
  --exclude='media/' --exclude='uploads/' --exclude='downloads/' --exclude='tmp/' --exclude='cache/'
  --exclude='*.pem' --exclude='*.key' --exclude='*.p12'
)

if command -v rsync >/dev/null 2>&1; then
  rsync -a --prune-empty-dirs "${excludes[@]}" "$source_dir/" "$target_dir/apps/founder-agent/"
elif command -v tar >/dev/null 2>&1; then
  tar -C "$source_dir" "${excludes[@]}" -cf - . | tar -C "$target_dir/apps/founder-agent" -xf -
else
  echo 'É necessário rsync ou tar para exportar o kit.' >&2
  exit 3
fi

# Mostra apenas nomes de variáveis, sem ler/imprimir valores.
{
  echo '# Copie para .env e preencha somente no ambiente do cliente.'
  echo '# Este arquivo é gerado a partir dos nomes encontrados na origem; não contém valores.'
  find "$source_dir" -maxdepth 2 -type f -name '.env*' -print0 |
    xargs -0 -r sed -nE 's/^[[:space:]]*(export[[:space:]]+)?([A-Za-z_][A-Za-z0-9_]*)=.*/\2=/p' |
    sort -u |
    sed 's/=$/=CHANGE_ME/'
} > "$target_dir/.env.example"

cat > "$target_dir/.gitignore" <<'IGNORE'
.env
.env.*
!.env.example
node_modules/
.wwebjs_auth*/
.wwebjs_cache/
*.sqlite
*.sqlite-*
*.db
*.db-*
*.log
logs/
backups/
media/
uploads/
downloads/
tmp/
cache/
*credentials*.json
*.pem
*.key
*.p12
IGNORE

# Detecta valores literais sensíveis antes de permitir o commit. Revise e remova da cópia,
# nunca da origem, se o scanner acusar algo.
secret_hits="$target_dir/.secret-scan.txt"
rg -n -i --glob '!README.md' --glob '!docs/**' --glob '!.env.example' --glob '!**/.env.example' \
  '(api[_-]?key|app[_-]?secret|client[_-]?secret|access[_-]?token|refresh[_-]?token|password|passwd)[[:space:]]*[:=][[:space:]]*[^[:space:]]{8,}|authorization:[[:space:]]*bearer[[:space:]]+[a-z0-9._-]{12,}|(sk|ghp|github_pat|AIza)_[a-z0-9_-]{12,}' \
  "$target_dir" > "$secret_hits" || true

if [[ -s "$secret_hits" ]]; then
  echo "A exportação foi interrompida: possíveis segredos encontrados na cópia." >&2
  echo "Revise somente os caminhos listados em $secret_hits; não envie o kit ao GitHub ainda." >&2
  exit 2
fi
rm -f "$secret_hits"

echo "Kit sanitizado criado em: $target_dir"
echo "Próximo passo: revisar git status e criar o repositório público somente após a revisão."
