const fs = require('fs');
const path = require('path');
const { markdownDir } = require('./config');

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

module.exports = { getTree, readFile };
