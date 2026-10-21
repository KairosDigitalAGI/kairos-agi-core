import assert from 'node:assert/strict'
import test from 'node:test'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { transformBot, transformDashboard } = require('../ops/kairos-whatsapp/bridgeInstaller.cjs')
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
