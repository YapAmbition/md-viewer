const path = require('path');
const fs = require('fs');

require('dotenv').config();

const markdownDir = path.resolve(process.env.MARKDOWN_DIR || './docs');
const port = parseInt(process.env.PORT, 10) || 3000;

// BASE_PATH must start and end with /
let basePath = process.env.BASE_PATH || '/';
if (!basePath.startsWith('/')) basePath = '/' + basePath;
if (!basePath.endsWith('/')) basePath = basePath + '/';

// Upload password (required for upload and delete operations)
const uploadPassword = process.env.UPLOAD_PASSWORD || '';

// Trash directory for soft delete
const trashDir = path.resolve(process.env.TRASH_DIR || './trash');

if (!fs.existsSync(markdownDir)) {
  console.error(`Markdown directory not found: ${markdownDir}`);
  process.exit(1);
}

// Ensure trash directory exists
if (!fs.existsSync(trashDir)) {
  fs.mkdirSync(trashDir, { recursive: true });
}

module.exports = {
  markdownDir,
  port,
  basePath,
  uploadPassword,
  trashDir,
};
