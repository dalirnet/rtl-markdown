const fs = require('fs')
const os = require('os')
const path = require('path')
const vscode = require('vscode')
const sudoPrompt = require('sudo-prompt')

const workbench = {
    target: 'vs/workbench/workbench.desktop.main.css',
    subject: path.resolve(__dirname, '../style/inject.css'),
    path: {
        get original() {
            return path.resolve(require.main.path, workbench.target)
        },
        get backup() {
            return workbench.path.original + '.backup'
        },
    },
    file(filePath) {
        if (fs.existsSync(filePath)) {
            return fs.readFileSync(filePath).toString()
        }

        return String()
    },
}

const injection = {
    flag: /\/\*rtl\-markdown\*\//,
    command: os.platform() === 'win32' ? 'type' : 'cat',
    status: () => {
        return !!workbench.file(workbench.path.original).match(injection.flag)
    },
    action: {
        active(sudo = true, callback) {
            if (sudo) {
                sudoPrompt.exec(
                    [
                        `${injection.command} "${workbench.path.original}" > "${workbench.path.backup}"`,
                        `${injection.command} "${workbench.subject}" >> "${workbench.path.original}"`,
                    ].join(' && '),
                    { name: 'RTL Markdown' },
                    callback
                )
            } else {
                fs.copyFile(workbench.path.original, workbench.path.backup, (error) => {
                    if (error) {
                        callback(error)
                    } else {
                        fs.appendFile(workbench.path.original, workbench.file(workbench.subject), callback)
                    }
                })
            }
        },
        deactive(sudo = true, callback) {
            if (sudo) {
                sudoPrompt.exec(`${injection.command} "${workbench.path.backup}" > "${workbench.path.original}"`, { name: 'RTL Markdown' }, callback)
            } else {
                fs.copyFile(workbench.path.backup, workbench.path.original, callback)
            }
        },
    },
}

const active = () => {
    if (!injection.status()) {
        vscode.window.showInformationMessage('"RTL Markdown" activation as ?', 'Administrator', 'Regular').then((as) => {
            if (as) {
                try {
                    injection.action.active(as === 'Administrator', (error) => {
                        if (error) {
                            console.log('rtl-markdown', error)
                            vscode.window.showErrorMessage('"RTL Markdown" cannot be active!', {
                                detail: error.message,
                                modal: true,
                            })
                        } else {
                            vscode.window.showInformationMessage('"RTL Markdown" was active successfully.', 'Restart').then((action) => {
                                if (action === 'Restart') {
                                    vscode.commands.executeCommand('workbench.action.reloadWindow')
                                }
                            })
                        }
                    })
                } catch (error) {
                    console.log('rtl-markdown', error)
                    vscode.window.showErrorMessage('"RTL Markdown" cannot be active!', {
                        detail: error.message,
                        modal: true,
                    })
                }
            }
        })
    } else {
        vscode.window.showInformationMessage('"RTL Markdown" is already active!')
    }
}

const deactive = () => {
    if (injection.status()) {
        vscode.window.showInformationMessage('"RTL Markdown" deactivation as ?', 'Administrator', 'Regular').then((as) => {
            if (as) {
                try {
                    injection.action.deactive(as === 'Administrator', (error) => {
                        if (error) {
                            console.log('rtl-markdown', error)
                            vscode.window.showErrorMessage('"RTL Markdown" cannot be deactive!', {
                                detail: error.message,
                                modal: true,
                            })
                        } else {
                            vscode.window.showInformationMessage('"RTL Markdown" was deactive successfully.', 'Restart').then((action) => {
                                if (action === 'Restart') {
                                    vscode.commands.executeCommand('workbench.action.reloadWindow')
                                }
                            })
                        }
                    })
                } catch (error) {
                    console.log('rtl-markdown', error)
                    vscode.window.showErrorMessage('"RTL Markdown" cannot be deactive!', {
                        detail: error.message,
                        modal: true,
                    })
                }
            }
        })
    } else {
        vscode.window.showInformationMessage('"RTL Markdown" is already deactive!')
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
        vscode.window.showWarningMessage('"RTL Markdown" is not active!', 'Active').then((action) => {
            if (action === 'Active') {
                active()
            }
        })
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
