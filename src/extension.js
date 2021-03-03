const vscode = require('vscode')

function activate(context) {
    console.log('Congratulations, your extension "rtl-markdown" is now active!')

    let rtl = vscode.commands.registerCommand('rtl-markdown.rtl', function () {
        vscode.window.showInformationMessage('Hello World from RTL Markdown!')
    })

    let ltr = vscode.commands.registerCommand('rtl-markdown.ltr', function () {
        vscode.window.showInformationMessage('Hello World from LTR Markdown!')
    })

    context.subscriptions.push(...[rtl, ltr])
}

function deactivate() {}

module.exports = {
    activate,
    deactivate,
}
