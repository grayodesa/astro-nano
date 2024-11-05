import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.join(__dirname, '..');
const POSTS_DIR = path.join(PROJECT_ROOT, 'src', 'content', 'posts');

async function getLastPostId() {
  try {
    const files = await fs.readdir(POSTS_DIR);
    
    // Filter only markdown files and sort them in reverse order
    const markdownFiles = files.filter(f => f.endsWith('.md')).sort().reverse();
    
    if (markdownFiles.length === 0) return 0;
    
    // Read the latest file's content
    const latestFile = markdownFiles[0];
    const content = await fs.readFile(path.join(POSTS_DIR, latestFile), 'utf-8');
    
    // Extract the URL from frontmatter
    const urlMatch = content.match(/url:\s*"\/(\d+)"/);
    return urlMatch ? parseInt(urlMatch[1]) : 0;
  } catch (error) {
    console.error('Error reading posts directory:', error);
    return 0;
  }
}

async function createNewPost() {
  const lastId = await getLastPostId();
  const newId = lastId + 1;
  
  // Generate date components
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const second = String(now.getSeconds()).padStart(2, '0');
  
  // Create filename
  const filename = `${year}-${month}-${day}-${newId}.md`;
  
  // Create post content
  const content = `---
date: "${year}-${month}-${day}T${hour}:${minute}:${second}"
draft: false
url: "/${newId}"
images: []
source: ""
forwarded_from: ""
---

`;

  try {
    await fs.mkdir(POSTS_DIR, { recursive: true });
    const filePath = path.join(POSTS_DIR, filename);
    await fs.writeFile(filePath, content);
    
    // Use absolute path and execSync to ensure the file opens
    const absolutePath = path.resolve(filePath);
    execSync(`code --wait --reuse-window "${absolutePath}"`);
    
    console.log(`Created and opened: ${filename}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

createNewPost(); 