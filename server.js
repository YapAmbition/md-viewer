const express = require('express');
const path = require('path');
const { port } = require('./src/config');
const { getTree, readFile } = require('./src/fileService');

const app = express();

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
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Markdown Viewer running at http://localhost:${port}`);
});
