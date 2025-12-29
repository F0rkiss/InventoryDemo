import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import dotenv from 'dotenv';
import basicSsl from '@vitejs/plugin-basic-ssl';

const SRC_DIR = path.resolve(__dirname, './src');
const PUBLIC_DIR = path.resolve(__dirname, './public');
const BUILD_DIR = path.resolve(__dirname, './www');
dotenv.config();

export default defineConfig({
  plugins: [
    react(),
    // basicSsl()
  ],
  root: SRC_DIR,
  base: './',
  publicDir: PUBLIC_DIR,
  build: {
    outDir: BUILD_DIR,
    assetsInlineLimit: 0,
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      treeshake: false,
      input: {
        main: path.resolve(SRC_DIR, 'index.html'),
      },
    },
  },
  resolve: {
    alias: {
      '@': SRC_DIR,
      'quill': path.resolve(__dirname, 'node_modules/quill'),
    },
  },
  server: {
    allowedHosts:[
      'inventory.mediaindonesia.com',
    ],
    host: true,
    // https: true,
    historyApiFallback: true, // Ensure all routes are handled by SPA
  },
  css: {
    postcss: {
      plugins: [
        tailwindcss(),
        autoprefixer(),
      ],
    },
  },
});
