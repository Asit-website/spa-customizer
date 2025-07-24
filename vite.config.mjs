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
      entry: path.resolve(__dirname, 'embed-widget.jsx'), // ✅ your entry file
      name: 'EmbedWidget',
      fileName: 'embed-widget',
      formats: ['umd'],
    },
    // ✅ DO NOT use "external" here
    // Everything, including React, must be bundled
    outDir: 'public/widget',
    emptyOutDir: true,
    minify: false,
  },
});
