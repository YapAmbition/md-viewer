const fs = require('fs');
const path = require('path');
const { markdownDir, trashDir } = require('./config');

const MD_EXTENSIONS = new Set(['.md', '.markdown']);

function isMarkdownFile(filename) {
  return MD_EXTENSIONS.has(path.extname(filename).toLowerCase());
}

function isHidden(name) {
  return name.startsWith('.');
}

function buildTree(dirPath, relativePath = '') {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const children = [];

  for (const entry of entries) {
    if (isHidden(entry.name)) continue;

    const entryRelPath = relativePath ? `${relativePath}/${entry.name}` : entry.name;
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      const subtree = buildTree(fullPath, entryRelPath);
      if (subtree.children.length > 0) {
        children.push(subtree);
      }
    } else if (entry.isFile() && isMarkdownFile(entry.name)) {
      const stat = fs.statSync(fullPath);
      children.push({
        name: entry.name,
        type: 'file',
        path: entryRelPath,
        mtime: stat.mtimeMs,
      });
    }
  }

  // Default sort: directories first, then alphabetical
  children.sort((a, b) => {
    if (a.type === b.type) return a.name.localeCompare(b.name);
    return a.type === 'directory' ? -1 : 1;
  });

  return {
    name: path.basename(dirPath),
    type: 'directory',
    path: relativePath,
    children,
  };
}

function getTree() {
  return buildTree(markdownDir);
}

function readFile(relativePath) {
  const normalized = path.normalize(relativePath);
  if (normalized.startsWith('..') || path.isAbsolute(normalized)) {
    return null;
  }

  const fullPath = path.resolve(markdownDir, normalized);
  if (!fullPath.startsWith(markdownDir)) {
    return null;
  }

  if (!isMarkdownFile(fullPath)) {
    return null;
  }

  if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) {
    return null;
  }

  return {
    content: fs.readFileSync(fullPath, 'utf-8'),
    filename: path.basename(fullPath),
  };
}

function uploadFile(filename, buffer, subDir) {
  if (!isMarkdownFile(filename)) {
    return { error: 'Only .md or .markdown files are allowed' };
  }

  // Sanitize filename
  const safeName = path.basename(filename);
  if (isHidden(safeName)) {
    return { error: 'Hidden files are not allowed' };
  }

  let targetDir = markdownDir;
  if (subDir) {
    const normalizedSub = path.normalize(subDir);
    if (normalizedSub.startsWith('..') || path.isAbsolute(normalizedSub)) {
      return { error: 'Invalid directory path' };
    }
    targetDir = path.resolve(markdownDir, normalizedSub);
    if (!targetDir.startsWith(markdownDir)) {
      return { error: 'Invalid directory path' };
    }
  }

  // Create directory if it doesn't exist
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const fullPath = path.join(targetDir, safeName);
  fs.writeFileSync(fullPath, buffer);

  const relativePath = path.relative(markdownDir, fullPath);
  return { success: true, path: relativePath, filename: safeName };
}

function softDeleteFile(relativePath) {
  const normalized = path.normalize(relativePath);
  if (normalized.startsWith('..') || path.isAbsolute(normalized)) {
    return { error: 'Invalid file path' };
  }

  const fullPath = path.resolve(markdownDir, normalized);
  if (!fullPath.startsWith(markdownDir)) {
    return { error: 'Invalid file path' };
  }

  if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) {
    return { error: 'File not found' };
  }

  // Preserve directory structure in trash
  const relDir = path.dirname(normalized);
  const trashTarget = path.join(trashDir, relDir);
  if (!fs.existsSync(trashTarget)) {
    fs.mkdirSync(trashTarget, { recursive: true });
  }

  // If same filename exists in trash, append timestamp
  let destName = path.basename(fullPath);
  let destPath = path.join(trashTarget, destName);
  if (fs.existsSync(destPath)) {
    const ext = path.extname(destName);
    const base = path.basename(destName, ext);
    destName = `${base}_${Date.now()}${ext}`;
    destPath = path.join(trashTarget, destName);
  }

  fs.renameSync(fullPath, destPath);
  return { success: true };
}

module.exports = { getTree, readFile, uploadFile, softDeleteFile };
