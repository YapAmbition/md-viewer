const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { port, basePath, uploadPassword } = require('./src/config');
const { getTree, readFile, uploadFile, softDeleteFile } = require('./src/fileService');

const app = express();
app.use(express.json());

// Multer config - store in memory, limit 10MB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Password verification middleware
function requirePassword(req, res, next) {
  if (!uploadPassword) {
    return res.status(403).json({ error: 'Upload password not configured on server' });
  }
  const password = req.body?.password || req.headers['x-upload-password'];
  if (password !== uploadPassword) {
    return res.status(401).json({ error: 'Invalid password' });
  }
  next();
}

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

// Upload file API
app.post('/api/upload', upload.single('file'), (req, res) => {
  // Check password from multipart form field
  if (!uploadPassword) {
    return res.status(403).json({ error: 'Upload password not configured on server' });
  }
  if (req.body?.password !== uploadPassword) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const subDir = req.body.directory || '';
    const result = uploadFile(req.file.originalname, req.file.buffer, subDir);
    if (result.error) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Delete file API (soft delete)
app.post('/api/delete', requirePassword, (req, res) => {
  const filePath = req.body.path;
  if (!filePath) {
    return res.status(400).json({ error: 'Missing file path' });
  }

  try {
    const result = softDeleteFile(filePath);
    if (result.error) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete file' });
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
