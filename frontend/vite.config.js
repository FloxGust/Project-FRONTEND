import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const hmrHost = env.VITE_HMR_HOST
  const hmrPort = Number(env.VITE_HMR_PORT || 5173)
  const hmrClientPort = Number(env.VITE_HMR_CLIENT_PORT || hmrPort)
  const hmrProtocol = env.VITE_HMR_PROTOCOL || 'ws'
  const usePublicDomain = String(env.VITE_PUBLIC_DOMAIN || 'true').toLowerCase() === 'true'
  const dbProxyTarget = usePublicDomain
    ? env.VITE_DB_PUBLIC_PROXY_TARGET || 'https://db.paiac.store'
    : env.VITE_DB_LOCAL_PROXY_TARGET || 'http://host.docker.internal:8000'
  const dbProxySecure = usePublicDomain
    ? String(env.VITE_DB_PUBLIC_PROXY_SECURE || 'true').toLowerCase() === 'true'
    : String(env.VITE_DB_LOCAL_PROXY_SECURE || 'false').toLowerCase() === 'true'
  const sedrProxyTarget = env.VITE_SEDR_PROXY_TARGET || 'http://host.docker.internal:9003'

  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 5173,
      historyApiFallback: true,
      watch: {
        usePolling: true,
        interval: 10,
        binaryInterval: 600000,
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
        '/db-proxy': {
          target: dbProxyTarget,
          changeOrigin: true,
          secure: dbProxySecure,
          rewrite: (path) => path.replace(/^\/db-proxy/, ''),
        },
        '/sedr-publish': {
          target: sedrProxyTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/sedr-publish/, ''),
        },
        '/ws': {
          target: 'ws://backend:8181',
          ws: true,
        },
      },
    },
  }
})
