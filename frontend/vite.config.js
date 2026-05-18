import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load .env from project root to get BASE_PATH
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

// BASE_PATH for Vite build (must start and end with /)
let basePath = process.env.BASE_PATH || '/';
if (!basePath.startsWith('/')) basePath = '/' + basePath;
if (!basePath.endsWith('/')) basePath = basePath + '/';

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    {
      name: 'copy-animal-assets',
      closeBundle() {
        const srcDir = path.resolve(__dirname, 'node_modules/animal-island-ui/dist/files');
        const destDir = path.resolve(__dirname, '../dist/files');
        if (fs.existsSync(srcDir)) {
          fs.mkdirSync(destDir, { recursive: true });
          const files = fs.readdirSync(srcDir);
          for (const file of files) {
            const srcFile = path.join(srcDir, file);
            const destFile = path.join(destDir, file);
            if (!fs.existsSync(destFile)) {
              fs.copyFileSync(srcFile, destFile);
            }
          }
        }
      },
    },
  ],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
