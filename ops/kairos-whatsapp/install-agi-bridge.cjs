const fs = require('fs')
const path = require('path')
const { transformBot, transformDashboard } = require('./bridgeInstaller.cjs')

const root = '/root/kairos3'
const botPath = path.join(root, 'bot.js')
const dashboardPath = path.join(root, 'dashboard.js')
const dependencies = ['agiBridge.cjs', 'crmAudit.cjs', 'runtimeRuns.cjs', 'runReceipt.cjs']

function main() {
  for (const name of dependencies) {
    if (!fs.existsSync(path.join(root, 'src', name))) throw new Error(`Módulo ${name} ausente na VPS; instalação cancelada.`)
  }
  const originalBot = fs.readFileSync(botPath, 'utf8')
  const originalDashboard = fs.readFileSync(dashboardPath, 'utf8')
  const nextBot = transformBot(originalBot)
  const nextDashboard = transformDashboard(originalDashboard)
  const changed = { bot: nextBot !== originalBot, dashboard: nextDashboard !== originalDashboard }
  if (process.argv.includes('--check')) {
    console.log(JSON.stringify({ status: 'ready', changed }))
    return
  }
  const timestamp = Date.now()
  const updates = [
    { file: botPath, content: nextBot, changed: changed.bot },
    { file: dashboardPath, content: nextDashboard, changed: changed.dashboard },
  ].filter(update => update.changed)
  for (const update of updates) {
    update.backup = `${update.file}.bak-pre-agi-bridge-${timestamp}`
    update.temporary = `${update.file}.${process.pid}.tmp`
    fs.copyFileSync(update.file, update.backup)
    fs.writeFileSync(update.temporary, update.content, { mode: 0o600 })
  }
  const applied = []
  try {
    for (const update of updates) {
      fs.renameSync(update.temporary, update.file)
      applied.push(update)
    }
  } catch (error) {
    for (const update of applied.reverse()) fs.copyFileSync(update.backup, update.file)
    throw error
  }
  console.log(JSON.stringify({ status: 'installed', changed }))
}

if (require.main === module) main()
module.exports = { main }
