// vite.config.mjs
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  define: {
    // ✅ This is what Vite will replace in the UMD bundle
    'process.env.NODE_ENV': '"production"',
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'embed-widget.jsx'),
      name: 'EmbedWidget',
      fileName: 'embed-widget',
      formats: ['umd'],
    },
    outDir: 'public/widget',
    emptyOutDir: true,
  },
})
