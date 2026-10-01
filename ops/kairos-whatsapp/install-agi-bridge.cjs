const fs = require('fs')
const path = '/root/kairos3/bot.js'
let source = fs.readFileSync(path, 'utf8')
if (!source.includes('const agiBridge = require("./src/agiBridge")')) {
  source = source.replace('const campanhaAprovada = require("./src/campanhaAprovada");', 'const campanhaAprovada = require("./src/campanhaAprovada");\nconst agiBridge = require("./src/agiBridge");')
}
if (!source.includes('agiBridge.start({')) {
  source = source.replace('  socialMedia.setGlobalSend(globalSendFn);', '  socialMedia.setGlobalSend(globalSendFn);\n  agiBridge.start({ notify: (text) => globalSendFn(MATHEUS, text), logger });')
}
if (!source.includes('case "/upgrade":')) {
  source = source.replace('    switch (slash) {', `    switch (slash) {
      case "/upgrade": {
        const result = await agiBridge.createDevRequest(arg);
        const request = result.request;
        await client.sendMessage(getReplyTarget(msg),
          "🧩 *Pedido de evolução registrado*\\n\\n" + request.title +
          "\\n\\nAntes de qualquer alteração de código, confirme com:\\n*/confirmar " + request.confirmation_code + "*" +
          "\\n\\nDepois da confirmação, Codex ou Claude Code poderá assumir. Eu aviso análise, progresso, conclusão, bloqueio ou erro aqui no WhatsApp."
        );
        break;
      }
      case "/confirmar": {
        const result = await agiBridge.confirmDevRequest(arg);
        await client.sendMessage(getReplyTarget(msg),
          "✅ *Upgrade confirmado*\\n\\n" + result.request.title +
          "\\n\\nEntrou na fila técnica do Kairos AGI. Vou avisar cada mudança de estado por aqui."
        );
        break;
      }
      case "/devstatus": {
        await agiBridge.pollUpdates((text) => client.sendMessage(getReplyTarget(msg), text));
        await client.sendMessage(getReplyTarget(msg), "🟢 Fila de evolução consultada no Kairos AGI.");
        break;
      }
`)
}
fs.copyFileSync(path, `${path}.bak-pre-agi-bridge-${Date.now()}`)
fs.writeFileSync(path, source)

const dashboard = '/root/kairos3/dashboard.js'
let dash = fs.readFileSync(dashboard, 'utf8')
dash = dash.replace('app.listen(3001, () =>', 'app.listen(3001, "127.0.0.1", () =>')
fs.copyFileSync(dashboard, `${dashboard}.bak-pre-private-${Date.now()}`)
fs.writeFileSync(dashboard, dash)
