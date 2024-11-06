const vscode = require('vscode');
const { OpenAI } = require('openai');

let openai;

async function getGitDiff() {
    const gitExtension = vscode.extensions.getExtension('vscode.git');
    if (!gitExtension) {
        throw new Error('Git extension is not installed');
    }

    const api = gitExtension.exports.getAPI(1);
    const repo = api.repositories[0];
    
    if (!repo) {
        throw new Error('No git repository found');
    }

    const diff = await repo.diff(true);
    if (!diff) {
        throw new Error('No changes to commit');
    }

    return diff;
}

async function generateCommitMessage(diff) {
    if (!openai) {
        const config = vscode.workspace.getConfiguration('commitMessageGenerator');
        let apiKey = config.get('openaiApiKey');
        
        if (!apiKey) {
            apiKey = await vscode.window.showInputBox({
                prompt: 'Please enter your OpenAI API key',
                password: true
            });
            
            if (!apiKey) {
                throw new Error('OpenAI API key is required');
            }
            
            await config.update('openaiApiKey', apiKey, true);
        }
        
        openai = new OpenAI({ apiKey });
    }

    const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
            {
                role: "system",
                content: `You are a commit message generator that follows conventional commits format.
                Always prefix commits with type (feat|fix|docs|style|refactor|test|chore) followed by optional scope.
                Keep messages concise (<50 chars) and use imperative mood.
                Focus on what changes accomplish, not what was done.`
            },
            {
                role: "user",
                content: `Generate a conventional commit message for this diff:\n${diff}`
            }
        ],
        max_tokens: 60,
        temperature: 0.5
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
