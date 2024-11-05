const vscode = require('vscode');
const fs = require('fs').promises;
const path = require('path');

async function getLastPostId(postsDir) {
    try {
        const files = await fs.readdir(postsDir);
        const markdownFiles = files.filter(f => f.endsWith('.md')).sort().reverse();
        
        if (markdownFiles.length === 0) return 0;
        
        const content = await fs.readFile(path.join(postsDir, markdownFiles[0]), 'utf-8');
        const urlMatch = content.match(/url:\s*"\/(\d+)"/);
        return urlMatch ? parseInt(urlMatch[1]) : 0;
    } catch (error) {
        console.error('Error reading posts directory:', error);
        return 0;
    }
}

async function activate(context) {
    let disposable = vscode.commands.registerCommand('tg-post-creator.createPost', async () => {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('No workspace folder open');
            return;
        }

        const POSTS_DIR = path.join(workspaceFolders[0].uri.fsPath, 'src', 'content', 'posts');
        
        try {
            const lastId = await getLastPostId(POSTS_DIR);
            const newId = lastId + 1;
            
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hour = String(now.getHours()).padStart(2, '0');
            const minute = String(now.getMinutes()).padStart(2, '0');
            const second = String(now.getSeconds()).padStart(2, '0');
            
            const filename = `${year}-${month}-${day}-${newId}.md`;
            const content = `---
date: "${year}-${month}-${day}T${hour}:${minute}:${second}"
draft: false
url: "/${newId}"
images: 
    - 
source: ""
forwarded_from: ""
---

`;
            await fs.mkdir(POSTS_DIR, { recursive: true });
            const filePath = path.join(POSTS_DIR, filename);
            await fs.writeFile(filePath, content);

            // Open the new file
            const document = await vscode.workspace.openTextDocument(filePath);
            await vscode.window.showTextDocument(document);
            
            vscode.window.showInformationMessage(`Created new post: ${filename}`);
        } catch (error) {
            vscode.window.showErrorMessage(`Error creating post: ${error.message}`);
        }
    });

    context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
}; 