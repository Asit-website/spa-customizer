// vite.config.mjs
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'embed-widget.jsx'),
      name: 'EmbedWidget',
      fileName: 'embed-widget',
      formats: ['umd'],
    },
    // ✅ REMOVE rollupOptions.external
    outDir: 'public/widget',
    emptyOutDir: true,
  },
});
