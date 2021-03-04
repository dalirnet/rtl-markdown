const fs = require('fs')
const os = require('os')
const path = require('path')
const crypto = require('crypto')
const sudoPrompt = require('sudo-prompt')
const vscode = require('vscode')

const rootPath = path.resolve(require.main.path, '../')
const mainStyleKey = 'vs/workbench/workbench.desktop.main.css'
const mainStylePath = path.resolve(require.main.path, mainStyleKey)
const injectStyleContent = fs.readFileSync(path.resolve(__dirname, 'style.css'))
const injectFlag = /\/\*rtl\-markdown\-flag\*\//

const prompt = () => {
    sudoPrompt.exec('whoami', { name: 'RTL Markdown' }, function (error, stdout, stderr) {
        if (error) {
            console.log('error', error)
        } else {
            console.log('stdout: ' + stdout)
        }
    })
}
const checksum = () => {
    const mainStyleContent = fs.existsSync(mainStylePath) ? fs.readFileSync(mainStylePath).toString() : String()
    try {
        let product = JSON.parse(fs.readFileSync(path.resolve(rootPath, 'product.json')))
        product.checksums[mainStyleKey] = crypto.createHash('md5').update(mainStyleContent).digest('base64').replace(/=+$/, '')

        console.log(product.checksums[mainStyleKey])
        console.log(crypto.createHash('md5').update(mainStyleContent).digest('base64').replace(/=+$/, ''))
    } catch (e) {
        console.log(e)
    }
}

const install = () => {
    const mainStyleContent = fs.existsSync(mainStylePath) ? fs.readFileSync(mainStylePath).toString() : String()
    if (!mainStyleContent.match(injectFlag)) {
        try {
            fs.appendFileSync(mainStylePath, '\n' + injectStyleContent)
            vscode.window.showInformationMessage('RTL Markdown was installed successfully')
        } catch (e) {
            if (os.platform() === 'win32') {
                vscode.window.showWarningMessage('Reopen the vscode with "run as administrator"')
            } else {
                vscode.window.showWarningMessage('Follow the terminal command to grant "sudo" access')
                const terminal = vscode.window.createTerminal('RTL Markdown init')
                terminal.sendText('sudo chown -R $(whoami) ' + rootPath)
                terminal.show()
            }
        }
    }
}

const switchDirection = (from, to) => {
    prompt()
    // const mainStyleContent = fs.existsSync(mainStylePath) ? fs.readFileSync(mainStylePath).toString() : String()
    // checksum()
    // if (mainStyleContent.match(injectFlag)) {
    //     const workspaceEdit = new vscode.WorkspaceEdit()
    //     if (vscode.window.activeTextEditor) {
    //         workspaceEdit.renameFile(
    //             vscode.Uri.file(vscode.window.activeTextEditor.document.uri.fsPath),
    //             vscode.Uri.file(vscode.window.activeTextEditor.document.uri.fsPath.replace(new RegExp(from + '$', 'i'), to))
    //         )
    //         vscode.workspace.applyEdit(workspaceEdit)
    //     }
    // } else {
    //     vscode.window.showWarningMessage('RTL Markdown is not installed!', { title: 'Install', id: 'install' }).then(({ id }) => {
    //         if (id === 'install') {
    //             install()
    //         }
    //     })
    // }
}

module.exports = {
    activate: (context) => {
        context.subscriptions.push([
            vscode.commands.registerCommand('rtl-markdown.install', () => install()),
            vscode.commands.registerCommand('rtl-markdown.rtl', () => switchDirection('.md', '.rtl.md')),
            vscode.commands.registerCommand('rtl-markdown.ltr', () => switchDirection('.rtl.md', '.md')),
        ])
    },
    deactivate: () => {},
}
