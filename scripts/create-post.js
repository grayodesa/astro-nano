// ES модули вместо CommonJS
import * as fs from "fs/promises";
import * as path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { fileURLToPath } from "url";

const execPromise = promisify(exec);

// Получаем текущую директорию для ES модулей
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Функция для получения текста из буфера обмена
async function getClipboardText() {
  let clipboardText = "";

  // Определяем команду для получения текста из буфера обмена в зависимости от ОС
  let command = "";
  if (process.platform === "darwin") {
    // macOS
    command = "pbpaste";
  } else if (process.platform === "linux") {
    // Linux (требует xclip)
    command = "xclip -selection clipboard -o";
  } else if (process.platform === "win32") {
    // Windows (требует PowerShell)
    command = 'powershell -command "Get-Clipboard"';
  } else {
    throw new Error(`Неподдерживаемая платформа: ${process.platform}`);
  }

  try {
    const { stdout } = await execPromise(command);
    clipboardText = stdout;
  } catch (error) {
    console.error("Ошибка при получении текста из буфера обмена:", error);
    throw error;
  }

  return clipboardText;
}

// Функция для обработки текста из буфера обмена
async function processText(text) {
  const lines = text.trim().split("\n");
  let source = "";
  let content = text;

  // Проверка, является ли последняя строка URL
  const lastLine = lines[lines.length - 1];
  const urlRegex = /^https?:\/\/[^\s]+$/;

  if (urlRegex.test(lastLine)) {
    source = lastLine;
    // Удаляем последнюю строку (URL) из контента
    content = lines.slice(0, -1).join("\n").trim();
  }

  return { content, source };
}

// Функция для получения последнего ID поста
async function getLastPostId(postsDir) {
  try {
    const files = await fs.readdir(postsDir);
    const markdownFiles = files
      .filter((f) => f.endsWith(".md"))
      // Извлекаем ID из имени файла и сортируем по числовому значению
      .sort((a, b) => {
        const idA = parseInt(a.match(/\d+(?=\.md$)/)?.[0] || 0);
        const idB = parseInt(b.match(/\d+(?=\.md$)/)?.[0] || 0);
        return idB - idA;
      });

    if (markdownFiles.length === 0) return 0;

    // Проверяем frontmatter первого файла (с наибольшим ID)
    const content = await fs.readFile(
      path.join(postsDir, markdownFiles[0]),
      "utf-8",
    );
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

    if (frontmatterMatch) {
      const urlMatch = frontmatterMatch[1].match(/url:\s*"\/(\d+)"/);
      if (urlMatch) {
        const id = parseInt(urlMatch[1]);
        // Дополнительная проверка соответствия ID в имени файла и во frontmatter
        const fileId = parseInt(
          markdownFiles[0].match(/\d+(?=\.md$)/)?.[0] || 0,
        );
        if (id !== fileId) {
          console.warn(
            `Предупреждение: Несоответствие между ID в имени файла (${fileId}) и ID во frontmatter (${id})`,
          );
        }
        return Math.max(id, fileId);
      }
    }

    // Если не нашли ID во frontmatter, используем ID из имени файла
    const fileId = parseInt(markdownFiles[0].match(/\d+(?=\.md$)/)?.[0] || 0);
    return fileId;
  } catch (error) {
    console.error("Ошибка при чтении директории постов:", error);
    return 0;
  }
}

// Главная функция для создания нового поста
async function createPost() {
  try {
    // Получаем путь к проекту
    const projectRoot = process.cwd();
    const POSTS_DIR = path.join(projectRoot, "src", "content", "posts");

    // Получаем текст из буфера обмена
    const clipboardText = await getClipboardText();
    const { content, source } = await processText(clipboardText);

    // Получаем последний ID и генерируем новый
    const lastId = await getLastPostId(POSTS_DIR);
    const newId = lastId + 1;

    // Получаем текущую дату и время
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hour = String(now.getHours()).padStart(2, "0");
    const minute = String(now.getMinutes()).padStart(2, "0");
    const second = String(now.getSeconds()).padStart(2, "0");

    // Создаем имя файла и содержимое
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

${content}
`;

    // Создаем директорию, если она не существует
    await fs.mkdir(POSTS_DIR, { recursive: true });

    // Записываем файл
    const filePath = path.join(POSTS_DIR, filename);
    await fs.writeFile(filePath, fileContent);

    console.log(`Создан новый пост: ${filename}`);

    // Выводим путь к файлу, чтобы Zed мог его открыть
    console.log(`Путь к файлу: ${filePath}`);

    // Запускаем Zed с новым файлом (опционально)
    try {
      await execPromise(`zed "${filePath}"`);
    } catch (error) {
      console.warn("Не удалось открыть файл в Zed. Откройте его вручную.");
    }
  } catch (error) {
    console.error("Ошибка при создании поста:", error);
  }
}

// Запускаем основную функцию
createPost();
