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

async function processText(text) {
    // Split into lines and remove empty lines from the end
    const lines = text.trim().split('\n');
    let source = '';
    let content = text;

    // Check if the last line is a URL
    const lastLine = lines[lines.length - 1];
    const urlRegex = /^https?:\/\/[^\s]+$/;
    
    if (urlRegex.test(lastLine)) {
        source = lastLine;
        // Remove the last line (URL) from content
        content = lines.slice(0, -1).join('\n').trim();
    }

    return { content, source };
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
            
            // Get clipboard content
            const clipboardText = await vscode.env.clipboard.readText();
            const { content: processedContent, source } = await processText(clipboardText);
            
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hour = String(now.getHours()).padStart(2, '0');
            const minute = String(now.getMinutes()).padStart(2, '0');
            const second = String(now.getSeconds()).padStart(2, '0');
            
            const filename = `${year}-${month}-${day}-${newId}.md`;
            const fileContent = `---
date: "${year}-${month}-${day}T${hour}:${minute}:${second}"
draft: false
url: "/${newId}"
source: "${source}"
images: 
    - 
forwarded_from: ""
---

${processedContent}
`;
            await fs.mkdir(POSTS_DIR, { recursive: true });
            const filePath = path.join(POSTS_DIR, filename);
            await fs.writeFile(filePath, fileContent);

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