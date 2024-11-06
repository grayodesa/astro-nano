const vscode = require('vscode');
const { OpenAI } = require('openai');

let openai;

async function getGitDiff() {
    const gitExtension = vscode.extensions.getExtension('vscode.git').exports;
    const api = gitExtension.getAPI(1);
    const repo = api.repositories[0];
    
    if (!repo) {
        throw new Error('No git repository found');
    }

    return await repo.diff(true);
}

async function generateCommitMessage(diff) {
    if (!openai) {
        const apiKey = await vscode.window.showInputBox({
            prompt: 'Please enter your OpenAI API key',
            password: true
        });
        
        if (!apiKey) {
            throw new Error('OpenAI API key is required');
        }
        
        openai = new OpenAI({ apiKey });
    }

    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: "system",
                content: "You are a helpful assistant that generates concise and informative git commit messages. Focus on the what and why of the changes."
            },
            {
                role: "user",
                content: `Generate a short, clear commit message for this diff:\n${diff}`
            }
        ],
        max_tokens: 60,
        temperature: 0.7
    });

    return response.choices[0].message.content.trim();
}

function activate(context) {
    let disposable = vscode.commands.registerCommand('commit-message-generator.generateMessage', async () => {
        try {
            const diff = await getGitDiff();
            if (!diff) {
                vscode.window.showWarningMessage('No changes detected');
                return;
            }

            const message = await generateCommitMessage(diff);
            
            const gitExtension = vscode.extensions.getExtension('vscode.git').exports;
            const api = gitExtension.getAPI(1);
            const repo = api.repositories[0];
            
            if (repo) {
                repo.inputBox.value = message;
                vscode.window.showInformationMessage('Commit message generated!');
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Error: ${error.message}`);
        }
    });

    context.subscriptions.push(disposable);
}

module.exports = {
    activate
};
