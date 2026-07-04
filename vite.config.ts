import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  base: './',
  build: {
    sourcemap: 'hidden',
    modulePreload: false,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        format: 'iife',
        inlineDynamicImports: true,
        entryFileNames: 'assets/app.js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
  plugins: [
    react({
      babel: {
        plugins: [
          'react-dev-locator',
        ],
      },
    }),
    tsconfigPaths(),
    // 生成支持 file:// 协议的 HTML
    {
      name: 'static-html-transform',
      transformIndexHtml(html) {
        return html
          .replace(/type="module"\s+/g, '')
          .replace(/\s+crossorigin/g, '')
          .replace(/crossorigin\s+/g, '')
          .replace('<script src="', '<script defer src="');
      },
    },
  ],
})
