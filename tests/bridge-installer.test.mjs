import assert from 'node:assert/strict'
import test from 'node:test'
import { createRequire } from 'node:module'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const require = createRequire(import.meta.url)
const { transformBot, transformDashboard } = require('../ops/kairos-whatsapp/bridgeInstaller.cjs')
const { installBridge } = require('../ops/kairos-whatsapp/install-agi-bridge.cjs')
const baseBot = `const campanhaAprovada = require("./src/campanhaAprovada");
async function run() {
  socialMedia.setGlobalSend(globalSendFn);
    switch (slash) { default: break; }
}`

test('bridge installer produces a loadable and idempotent bot patch', () => {
  const patched = transformBot(baseBot)
  assert.match(patched, /require\("\.\/src\/agiBridge\.cjs"\)/)
  assert.match(patched, /agiBridge\.start\(/)
  assert.match(patched, /case "\/upgrade":/)
  assert.match(patched, /case "\/confirmar":/)
  assert.match(patched, /case "\/devstatus":/)
  assert.doesNotThrow(() => new Function(patched))
  assert.equal(transformBot(patched), patched)
})

test('bridge installer migrates the legacy import without a duplicate declaration', () => {
  const previous = baseBot.replace('const campanhaAprovada = require("./src/campanhaAprovada");', 'const agiBridge = require("./src/agiBridge");')
  const patched = transformBot(previous)
  assert.equal(patched.match(/const agiBridge = require/g)?.length, 1)
  assert.match(patched, /agiBridge\.cjs/)
})

test('bridge installer rejects missing or partially installed anchors before writing', () => {
  assert.throws(() => transformBot(baseBot.replace('switch (slash)', 'switch (other)')), /ausente ou ambíguo/)
  assert.throws(() => transformBot(`${baseBot}\ncase "/upgrade":`), /parcialmente instalados/)
  assert.throws(() => transformBot(baseBot.replace('  socialMedia.setGlobalSend(globalSendFn);', '')), /ausente ou ambíguo/)
  const patched = transformBot(baseBot)
  assert.throws(() => transformBot(`${patched}\nconst agiBridge = require("./src/agiBridge.cjs");`), /ausente ou ambíguo/)
})

test('dashboard patch is private and idempotent', () => {
  const patched = transformDashboard('app.listen(3001, () => {})')
  assert.match(patched, /app\.listen\(3001, "127\.0\.0\.1"/)
  assert.equal(transformDashboard(patched), patched)
  assert.throws(() => transformDashboard('app.listen(4000, () => {})'), /ausente ou ambíguo/)
  assert.throws(() => transformDashboard(`${patched}\napp.listen(3001, () => {})`), /coexistem/)
})

function withFixture(run) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'kairos-bridge-'))
  try {
    fs.mkdirSync(path.join(root, 'src'))
    for (const name of ['agiBridge.cjs', 'crmAudit.cjs', 'runtimeRuns.cjs', 'runReceipt.cjs']) {
      fs.writeFileSync(path.join(root, 'src', name), 'module.exports = {}')
    }
    fs.writeFileSync(path.join(root, 'bot.js'), baseBot, { mode: 0o640 })
    fs.writeFileSync(path.join(root, 'dashboard.js'), 'app.listen(3001, () => {})', { mode: 0o640 })
    return run(root)
  } finally { fs.rmSync(root, { recursive: true, force: true }) }
}

test('preflight leaves files untouched; installation preserves permissions and can be repeated', () => withFixture(root => {
  const bot = path.join(root, 'bot.js')
  const original = fs.readFileSync(bot, 'utf8')
  const originalMode = fs.statSync(bot).mode & 0o777
  assert.deepEqual(installBridge({ root, check: true }).changed, { bot: true, dashboard: true })
  assert.equal(fs.readFileSync(bot, 'utf8'), original)
  assert.deepEqual(installBridge({ root }).changed, { bot: true, dashboard: true })
  assert.equal(fs.statSync(bot).mode & 0o777, originalMode)
  assert.match(fs.readFileSync(bot, 'utf8'), /agiBridge\.start/)
  assert.deepEqual(installBridge({ root }).changed, { bot: false, dashboard: false })
  assert.equal(fs.readdirSync(root).filter(name => name.endsWith('.tmp')).length, 0)
}))

test('failure on second replacement restores the first file and cleans staged temporaries', () => withFixture(root => {
  const bot = path.join(root, 'bot.js')
  const dashboard = path.join(root, 'dashboard.js')
  const beforeBot = fs.readFileSync(bot, 'utf8')
  const beforeDashboard = fs.readFileSync(dashboard, 'utf8')
  const fileSystem = { ...fs, renameSync(from, to) {
    if (to === dashboard) throw new Error('falha simulada')
    return fs.renameSync(from, to)
  } }
  assert.throws(() => installBridge({ root, fileSystem }), /falha simulada/)
  assert.equal(fs.readFileSync(bot, 'utf8'), beforeBot)
  assert.equal(fs.readFileSync(dashboard, 'utf8'), beforeDashboard)
  assert.equal(fs.readdirSync(root).filter(name => name.endsWith('.tmp')).length, 0)
}))
