import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      // Electronのメインプロセス用のエントリーポイントを設定します。
      'main': resolve(__dirname, 'src/index.js')
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