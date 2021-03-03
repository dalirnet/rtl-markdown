const fs = require('fs')
const os = require('os')
const path = require('path')
const vscode = require('vscode')

// workbench
const workbenchPath = path.resolve(require.main.path, ['vs', 'code', 'electron-browser', 'workbench', 'workbench.html'].join('/'))
const workbenchFile = fs.existsSync(mainPath) ? fs.readFileSync(mainPath).toString() : String()

const bashPath = path.resolve(__dirname, 'bash.js')
const stylePath = path.resolve(__dirname, 'style.css')
const styleFile = fs.readFileSync(stylePath).toString().replace(/\s+/g, String())

const init = () => {
    try {
        workbenchFile
        // const command = [os.platform === 'linux' ? 'sudo' : '', 'node', writerPath]
        // const terminal = vscode.window.createTerminal('RTL Markdown init')
        // terminal.show()
        // terminal.sendText(command.join(' '))
        // terminal.sendText('sudo cat /usr/share/code/resources/app/out/vs/code/electron-browser/workbench/workbench.html')
    } catch (e) {
        console.log(e)
    }
    // fs.appendFileSync(mainPath, '--')
    // console.log(mainFile.match(/\/*rtl-markdown-laga*\//))
}

const action = (from, to) => {
    const workspaceEdit = new vscode.WorkspaceEdit()
    if (vscode.window.activeTextEditor) {
        init()
        // workspaceEdit.renameFile(
        //     vscode.Uri.file(vscode.window.activeTextEditor.document.uri.fsPath),
        //     vscode.Uri.file(vscode.window.activeTextEditor.document.uri.fsPath.replace(new RegExp(from + '$', 'i'), to))
        // )
        // vscode.workspace.applyEdit(workspaceEdit)
    }
}

module.exports = {
    activate: (context) => {
        context.subscriptions.push([
            vscode.commands.registerCommand('rtl-markdown.rtl', () => action('.md', '.rtl.md')),
            vscode.commands.registerCommand('rtl-markdown.ltr', () => action('.rtl.md', '.md')),
        ])
    },
    deactivate: () => {},
}
