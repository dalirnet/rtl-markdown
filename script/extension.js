const fs = require('fs')
const os = require('os')
const path = require('path')
const sudoPrompt = require('sudo-prompt')
const vscode = require('vscode')

const workbench = {
    path: {
        get style() {
            return path.resolve(require.main.path, injection.target)
        },
        get backup() {
            return workbench.path.style + '.backup'
        },
    },
    file() {
        return fs.existsSync(workbench.path.style) ? fs.readFileSync(workbench.path.style).toString() : String()
    },
}

const injection = {
    command: os.platform() === 'win32' ? 'type' : 'cat',
    flag: /\/\*rtl\-markdown\*\//,
    target: 'vs/workbench/workbench.desktop.main.css',
    subject: path.resolve(__dirname, '../style/inject.css'),
    status: () => !!workbench.file().match(injection.flag),
}

const active = () => {
    if (!injection.status()) {
        const command = {
            backup() {
                return `${injection.command} "${workbench.path.style}" >> "${workbench.path.backup}"`
            },
            inject() {
                return `${injection.command} "${injection.subject}" >> "${workbench.path.style}"`
            },
        }
        try {
            sudoPrompt.exec([command.backup(), command.inject()].join(' && '), { name: 'RTL Markdown' }, (e) => {
                if (e) {
                    console.log('rtl-markdown', e)
                    vscode.window.showErrorMessage('"RTL Markdown" cannot be active!')
                } else {
                    vscode.window.showInformationMessage('"RTL Markdown" was active successfully.', 'Restart').then(() => {
                        vscode.commands.executeCommand('workbench.action.reloadWindow')
                    })
                }
            })
        } catch (e) {
            console.log('rtl-markdown', e)
            vscode.window.showErrorMessage('"RTL Markdown" cannot be active!')
        }
    } else {
        vscode.window.showWarningMessage('"RTL Markdown" is already active!')
    }
}

const deactive = () => {
    if (injection.status()) {
        const command = `${injection.command} "${workbench.path.backup}" > "${workbench.path.style}"`
        try {
            sudoPrompt.exec(command, { name: 'RTL Markdown' }, (e) => {
                if (e) {
                    console.log('rtl-markdown', e)
                    vscode.window.showErrorMessage('"RTL Markdown" cannot be deactive!')
                } else {
                    vscode.window.showInformationMessage('"RTL Markdown" was deactive successfully.', 'Restart').then(() => {
                        vscode.commands.executeCommand('workbench.action.reloadWindow')
                    })
                }
            })
        } catch (e) {
            console.log('rtl-markdown', e)
            vscode.window.showErrorMessage('"RTL Markdown" cannot be deactive!')
        }
    } else {
        vscode.window.showWarningMessage('"RTL Markdown" is already deactive!')
    }
}

const switchDirection = (from, to) => {
    if (injection.status()) {
        const workspaceEdit = new vscode.WorkspaceEdit()
        if (vscode.window.activeTextEditor) {
            workspaceEdit.renameFile(
                vscode.Uri.file(vscode.window.activeTextEditor.document.uri.fsPath),
                vscode.Uri.file(vscode.window.activeTextEditor.document.uri.fsPath.replace(new RegExp(from + '$', 'i'), to))
            )
            vscode.workspace.applyEdit(workspaceEdit)
        }
    } else {
        vscode.window.showWarningMessage('"RTL Markdown" is not active!', 'Active').then(() => active())
    }
}

module.exports = {
    activate: (context) => {
        context.subscriptions.push([
            vscode.commands.registerCommand('rtl-markdown.active', () => active()),
            vscode.commands.registerCommand('rtl-markdown.deactive', () => deactive()),
            vscode.commands.registerCommand('rtl-markdown.rtl', () => switchDirection('.md', '.rtl.md')),
            vscode.commands.registerCommand('rtl-markdown.ltr', () => switchDirection('.rtl.md', '.md')),
        ])
    },
    deactivate: () => {},
}
