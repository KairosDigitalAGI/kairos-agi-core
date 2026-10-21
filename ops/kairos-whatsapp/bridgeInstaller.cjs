const legacyImport = 'const agiBridge = require("./src/agiBridge");'
const currentImport = 'const agiBridge = require("./src/agiBridge.cjs");'
const importAnchor = 'const campanhaAprovada = require("./src/campanhaAprovada");'
const startAnchor = '  socialMedia.setGlobalSend(globalSendFn);'
const startCall = '  agiBridge.start({ notify: (text) => globalSendFn(MATHEUS, text), logger });'
const switchAnchor = '    switch (slash) {'
const commandCases = ['case "/upgrade":', 'case "/confirmar":', 'case "/devstatus":']

function replaceOnce(source, anchor, replacement, label) {
  const first = source.indexOf(anchor)
  if (first < 0 || source.indexOf(anchor, first + anchor.length) >= 0) throw new Error(`${label}: ponto de integração ausente ou ambíguo.`)
  return source.replace(anchor, replacement)
}

function requireOnce(source, anchor, label) {
  const first = source.indexOf(anchor)
  if (first < 0 || source.indexOf(anchor, first + anchor.length) >= 0) throw new Error(`${label}: ponto de integração ausente ou ambíguo.`)
}

function transformBot(input) {
  let source = String(input)
  if (source.includes(legacyImport)) {
    if (source.includes(currentImport)) throw new Error('Import antigo e novo coexistem no bot; arquivo preservado.')
    source = replaceOnce(source, legacyImport, currentImport, 'Import da ponte')
  } else if (!source.includes(currentImport)) {
    source = replaceOnce(source, importAnchor, `${importAnchor}\n${currentImport}`, 'Import da ponte')
  }
  if (!source.includes(startCall)) source = replaceOnce(source, startAnchor, `${startAnchor}\n${startCall}`, 'Inicialização da ponte')
  requireOnce(source, currentImport, 'Import da ponte')
  requireOnce(source, startCall, 'Inicialização da ponte')

  const present = commandCases.filter(marker => source.includes(marker))
  if (present.length > 0 && present.length < commandCases.length) throw new Error('Comandos de evolução parcialmente instalados; arquivo preservado.')
  if (present.length === commandCases.length) for (const marker of commandCases) requireOnce(source, marker, 'Comando de evolução')
  if (!present.length) source = replaceOnce(source, switchAnchor, `${switchAnchor}
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
  return source
}

function transformDashboard(input) {
  const source = String(input)
  const privateBinding = 'app.listen(3001, "127.0.0.1", () =>'
  if (source.includes(privateBinding)) {
    requireOnce(source, privateBinding, 'Binding privado do dashboard')
    if (source.includes('app.listen(3001, () =>')) throw new Error('Bindings privado e público coexistem; dashboard preservado.')
    return source
  }
  return replaceOnce(source, 'app.listen(3001, () =>', privateBinding, 'Binding privado do dashboard')
}

module.exports = { transformBot, transformDashboard }
