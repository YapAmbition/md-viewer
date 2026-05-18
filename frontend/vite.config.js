import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Use Vite's built-in loadEnv to read .env from project root
  const env = loadEnv(mode, path.resolve(__dirname, '..'), '');

  // BASE_PATH for Vite build (must start and end with /)
  let basePath = env.BASE_PATH || '/';
  if (!basePath.startsWith('/')) basePath = '/' + basePath;
  if (!basePath.endsWith('/')) basePath = basePath + '/';

  return {
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
  };
});
