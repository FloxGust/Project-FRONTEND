import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const hmrHost = env.VITE_HMR_HOST
  const hmrPort = Number(env.VITE_HMR_PORT || 5173)
  const hmrClientPort = Number(env.VITE_HMR_CLIENT_PORT || hmrPort)
  const hmrProtocol = env.VITE_HMR_PROTOCOL || 'ws'

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 5173,
      watch: {
        usePolling: true,
        interval: 50,
        binaryInterval: 100,
      },
      hmr: hmrHost
        ? {
            host: hmrHost,
            port: hmrPort,
            clientPort: hmrClientPort,
            protocol: hmrProtocol,
          }
        : undefined,
      proxy: {
        '/api': {
          target: 'http://backend:8181',
          changeOrigin: true,
        },
        '/agent-queue-proxy': {
          target: 'http://192.168.1.9:8000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/agent-queue-proxy/, ''),
        },
        '/ws': {
          target: 'ws://backend:8181',
          ws: true,
        },
      },
    },
  }
})
