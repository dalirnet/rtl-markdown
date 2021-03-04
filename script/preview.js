try {
    const data = JSON.parse(document.head.querySelector('meta[id="vscode-markdown-preview-data"]').getAttribute('data-state'))
    if (typeof data.resource === 'string') {
        if (data.resource.match(/\.rtl\.md$/)) {
            document.body.classList.add('vscode-body--rtl')
        }
    }
} catch (e) {
    console.log(e)
}
