const express = require('express');
const path = require('path');
const fs = require('fs');
const { port, basePath } = require('./src/config');
const { getTree, readFile } = require('./src/fileService');

const app = express();

// Serve index.html with BASE_PATH injected
const indexHtml = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf-8');
const injectedHtml = indexHtml
  .replace('</head>', `  <base href="${basePath}">\n  <script>window.__BASE_PATH__ = "${basePath}";</script>\n</head>`);

app.get('/', (req, res) => {
  res.type('html').send(injectedHtml);
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/tree', (req, res) => {
  try {
    const tree = getTree();
    res.json(tree);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read directory' });
  }
});

app.get('/api/file', (req, res) => {
  const filePath = req.query.path;
  if (!filePath) {
    return res.status(400).json({ error: 'Missing path parameter' });
  }

  try {
    const result = readFile(filePath);
    if (!result) {
      return res.status(404).json({ error: 'File not found' });
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to read file' });
  }
});

app.use((req, res) => {
  res.type('html').send(injectedHtml);
});

app.listen(port, () => {
  console.log(`Markdown Viewer running at http://localhost:${port}`);
  if (basePath !== '/') {
    console.log(`Base path: ${basePath}`);
  }
});
