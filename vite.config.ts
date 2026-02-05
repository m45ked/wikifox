import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  return {
    build: {
      minify: false,
      sourcemap: true,
      cssCodeSplit: false,
      emptyOutDir: false,
      rollupOptions: {
        input: resolve(__dirname, 'src/content/add-copy-button.ts'),
        output: {
          manualChunks: undefined,
          entryFileNames: '[name].js',
          assetFileNames: '[name].[ext]',
          exports: 'named',
          format: "iife",
          dir: resolve(__dirname, 'dist/content'),
          inlineDynamicImports: true,
          extend: true,
          name: 'add-copy-button',
        }
      },
      chunkSizeWarningLimit: 1000
    }
  }
});