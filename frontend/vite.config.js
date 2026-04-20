import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Dev-server config.
  //
  // `host: true` binds Vite on 0.0.0.0 so the dev server is reachable on the
  // LAN (e.g. http://192.168.1.41:5173 on your phone). `pnpm dev` also passes
  // `--host` in package.json, so either flag on its own is sufficient.
  //
  // `server.proxy` forwards /api/* from the page's own origin to the backend
  // running on the dev machine at localhost:8000. With this in place the
  // frontend can use a relative `VITE_API_BASE=/api` — which works identically
  // from localhost, from the LAN IP, and from any tunnel (ngrok, tailscale,
  // etc.) without needing CORS changes, because every request is same-origin
  // from the browser's perspective.
  //
  // The rewrite strips the `/api` prefix because backend routes are mounted at
  // the root (`/auth`, `/session`, `/health`, …) — not under `/api`.
  server: {
    host: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        // SSE endpoints (/session/{id}/stream, /chat/stream, …) must NOT be
        // buffered — otherwise tokens stall until the stream ends. Vite's
        // http-proxy passes through by default; leave it alone.
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          router: ['react-router-dom'],
          markdown: ['react-markdown', 'rehype-sanitize', 'remark-gfm'],
        },
      },
    },
    minify: 'esbuild',
    target: 'es2020',
    chunkSizeWarningLimit: 500,
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios'],
  },
})
