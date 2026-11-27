import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig(() => {
  const singleFile = process.env.SINGLE_FILE === '1';
  return {
    base: './',
    plugins: singleFile ? [viteSingleFile()] : [],
    build: {
      outDir: 'dist',
      target: 'es2022',
      assetsInlineLimit: singleFile ? 100_000_000 : 4096,
    },
    server: {
      port: 5173,
      strictPort: false,
    },
  };
});
