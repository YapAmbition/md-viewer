const path = require('path');
const fs = require('fs');

require('dotenv').config();

const markdownDir = path.resolve(process.env.MARKDOWN_DIR || './docs');
const port = parseInt(process.env.PORT, 10) || 3000;

// BASE_PATH must start and end with /
let basePath = process.env.BASE_PATH || '/';
if (!basePath.startsWith('/')) basePath = '/' + basePath;
if (!basePath.endsWith('/')) basePath = basePath + '/';

if (!fs.existsSync(markdownDir)) {
  console.error(`Markdown directory not found: ${markdownDir}`);
  process.exit(1);
}

module.exports = {
  markdownDir,
  port,
  basePath,
};
