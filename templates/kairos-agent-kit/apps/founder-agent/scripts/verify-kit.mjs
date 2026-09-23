import { readdir, readFile } from 'node:fs/promises'
import { join, relative } from 'node:path'

const root = process.cwd()
const forbiddenNames = new Set(['.env', 'google-credentials.json'])
const forbiddenParts = ['.wwebjs_auth', '.wwebjs_cache', 'node_modules', 'logs', 'backups', 'media', 'uploads', 'downloads', 'tmp', 'cache']
const extensions = ['.pem', '.key', '.p12', '.sqlite', '.db', '.log']
const secretPattern = /(api[_-]?key|app[_-]?secret|client[_-]?secret|access[_-]?token|refresh[_-]?token|password|passwd)\s*[:=]\s*[^\s]{8,}|authorization:\s*bearer\s+[a-z0-9._-]{12,}|(?:sk|ghp|github_pat|AIza)_[a-z0-9_-]{12,}/i

async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const out = []
  for (const entry of entries) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...await files(path))
    else if (entry.isFile()) out.push(path)
  }
  return out
}

const violations = []
for (const file of await files(root)) {
  const local = relative(root, file)
  const parts = local.split(/[\\/]/)
  if (forbiddenNames.has(parts.at(-1)) || forbiddenParts.some((part) => parts.some((value) => value === part || value.startsWith(part)))) {
    violations.push(`${local}: arquivo operacional não pode entrar no kit`)
    continue
  }
  if (extensions.some((extension) => local.endsWith(extension))) {
    violations.push(`${local}: extensão operacional não pode entrar no kit`)
    continue
  }
  if (parts.at(-1) === '.env.example' || local === 'README.md' || local.startsWith('docs/')) continue
  const content = await readFile(file, 'utf8')
  if (secretPattern.test(content)) violations.push(`${local}: provável segredo literal`)
}

if (violations.length) {
  console.error('Kit reprovado:')
  for (const violation of violations) console.error(`- ${violation}`)
  process.exit(1)
}
console.log('Kit verificado: nenhum dado operacional ou segredo literal encontrado.')
