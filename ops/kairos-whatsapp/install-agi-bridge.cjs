const fs = require('fs')
const path = require('path')
const { transformBot, transformDashboard } = require('./bridgeInstaller.cjs')

const dependencies = ['agiBridge.cjs', 'crmAudit.cjs', 'runtimeRuns.cjs', 'runReceipt.cjs']

function installBridge({ root = '/root/kairos3', check = false, fileSystem = fs } = {}) {
  const botPath = path.join(root, 'bot.js')
  const dashboardPath = path.join(root, 'dashboard.js')
  for (const name of dependencies) {
    if (!fileSystem.existsSync(path.join(root, 'src', name))) throw new Error(`Módulo ${name} ausente na VPS; instalação cancelada.`)
  }
  const originalBot = fileSystem.readFileSync(botPath, 'utf8')
  const originalDashboard = fileSystem.readFileSync(dashboardPath, 'utf8')
  const nextBot = transformBot(originalBot)
  const nextDashboard = transformDashboard(originalDashboard)
  const changed = { bot: nextBot !== originalBot, dashboard: nextDashboard !== originalDashboard }
  if (check) return { status: 'ready', changed }
  const timestamp = Date.now()
  const updates = [
    { file: botPath, content: nextBot, changed: changed.bot },
    { file: dashboardPath, content: nextDashboard, changed: changed.dashboard },
  ].filter(update => update.changed)
  if (!updates.length) return { status: 'installed', changed }
  const applied = []
  const staged = []
  try {
    for (const update of updates) {
      update.backup = `${update.file}.bak-pre-agi-bridge-${timestamp}-${process.pid}`
      update.temporary = `${update.file}.${timestamp}-${process.pid}.tmp`
      const mode = fileSystem.statSync(update.file).mode & 0o777
      fileSystem.copyFileSync(update.file, update.backup, fs.constants.COPYFILE_EXCL)
      staged.push(update)
      fileSystem.writeFileSync(update.temporary, update.content, { flag: 'wx', mode })
    }
    for (const update of updates) {
      fileSystem.renameSync(update.temporary, update.file)
      applied.push(update)
    }
  } catch (error) {
    const rollbackErrors = []
    for (const update of applied.reverse()) {
      try { fileSystem.copyFileSync(update.backup, update.file) } catch (rollbackError) { rollbackErrors.push(rollbackError) }
    }
    if (rollbackErrors.length) throw new AggregateError([error, ...rollbackErrors], 'Falha na instalação e na restauração; consulte os backups.')
    throw error
  } finally {
    for (const update of staged) {
      if (fileSystem.existsSync(update.temporary)) fileSystem.unlinkSync(update.temporary)
    }
  }
  return { status: 'installed', changed }
}

function main() { console.log(JSON.stringify(installBridge({ check: process.argv.includes('--check') }))) }
if (require.main === module) main()
module.exports = { main, installBridge }
