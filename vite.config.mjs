import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'


export default defineConfig({
  plugins: [react()],
   publicDir: false, 
  define: {
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.env': '{}', // fallback to avoid undefined
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'embed-widget.jsx'),
      name: 'EmbedWidget',
      fileName: 'bc-customiser-app',
      formats: ['umd'],
    },
    outDir: 'public/bc-app',
    emptyOutDir: true,
    minify: false
  },
})
