import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  return {
    build: {
      minify: mode === 'production',
      sourcemap: mode === 'development',        // Dodaj mapy źródłowe
      cssCodeSplit: false,
      emptyOutDir: false,
      rollupOptions: {
        input: resolve(__dirname, 'src/content/wiktionary.ts'),
        output: {
          // Tworzy jeden plik bez chunków
          manualChunks: undefined,
          entryFileNames: '[name].js',
          assetFileNames: '[name].[ext]',
          exports: 'named',
          format: "iife",
          dir: resolve(__dirname, 'dist/content'),
          inlineDynamicImports: true,
          name:  'wiktionary',
        }
      },
      chunkSizeWarningLimit: 1000
    }
  }
});