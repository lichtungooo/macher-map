import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

const rls = path.resolve(__dirname, '../real-life-stack/packages')

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      { find: '@real-life-stack/data-interface/demo-data', replacement: path.join(rls, 'data-interface/src/demo-data.ts') },
      { find: '@real-life-stack/data-interface', replacement: path.join(rls, 'data-interface/src/index.ts') },
      { find: '@real-life-stack/toolkit/styles/globals.css', replacement: path.join(rls, 'toolkit/src/styles/globals.css') },
      { find: '@real-life-stack/toolkit/lib/image-utils', replacement: path.join(rls, 'toolkit/src/lib/image-utils.ts') },
      { find: '@real-life-stack/toolkit', replacement: path.join(rls, 'toolkit/src/index.ts') },
      { find: '@real-life-stack/local-connector', replacement: path.join(rls, 'local-connector/src/index.ts') },
      { find: '@real-life-stack/mock-connector', replacement: path.join(rls, 'mock-connector/src/index.ts') },
      { find: '@real-life-stack/wot-connector/components', replacement: path.join(rls, 'wot-connector/src/components/index.ts') },
      { find: '@real-life-stack/wot-connector', replacement: path.join(rls, 'wot-connector/src/index.ts') },
      { find: '@web_of_trust/adapter-yjs', replacement: path.resolve(__dirname, '../web-of-trust/packages/adapter-yjs/src/index.ts') },
      { find: '@web_of_trust/core', replacement: path.resolve(__dirname, '../web-of-trust/packages/wot-core/src/index.ts') },
      // Antons Refactor (real-life-stack:master): Imports nutzen @real-life/* statt @web_of_trust/*
      // Pfade zeigen weiterhin auf web-of-trust-Paket-Source. Override per Vite-Alias damit
      // unabhaengig von pnpm-overrides geloest wird.
      { find: '@real-life/adapter-yjs', replacement: path.resolve(__dirname, '../web-of-trust/packages/adapter-yjs/src/index.ts') },
      { find: '@real-life/wot-core', replacement: path.resolve(__dirname, '../web-of-trust/packages/wot-core/src/index.ts') },
      { find: /^@\//, replacement: path.join(rls, 'toolkit/src') + '/' },
      // Force single React instance — prevent RLS deps from loading their own React
      { find: 'react', replacement: path.resolve(__dirname, 'node_modules/react') },
      { find: 'react-dom', replacement: path.resolve(__dirname, 'node_modules/react-dom') },
      { find: 'react/jsx-runtime', replacement: path.resolve(__dirname, 'node_modules/react/jsx-runtime') },
      { find: 'react/jsx-dev-runtime', replacement: path.resolve(__dirname, 'node_modules/react/jsx-dev-runtime') },
    ],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'lucide-react'],
  },
  server: {
    port: 5173,
    strictPort: true,
  },
})
