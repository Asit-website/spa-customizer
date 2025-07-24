// vite.config.mjs
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  define: {
    // ✅ This is crucial for React to work in browser builds
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'embed-widget.jsx'),
      name: 'EmbedWidget',
      fileName: 'embed-widget',
      formats: ['umd'],
    },
    // ✅ DO NOT USE "external" — you want to fully bundle React
    outDir: 'public/widget',
    emptyOutDir: true,
    minify: true,
  },
})
