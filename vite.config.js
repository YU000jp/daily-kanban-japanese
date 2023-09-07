import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      'main': resolve(__dirname, 'src/index.html')
    }
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    assetsDir: './',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/app/app.ts'),
      },
    },
  }
});