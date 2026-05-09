import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const buildId = env.VITE_BUILD_ID || `local-${Date.now()}`
  const buildTime = new Date().toISOString()

  return {
    // Use explicit GitHub Pages base so assets load reliably with or without trailing slash.
    base: '/student-reality-lab-Vazquez/',
    root: './',
    publicDir: 'public',

  // ⚠️ SECURITY FIX: Inject environment variables at build time
  // These become available in index.html via window.__VITE_ENV__
    define: {
      __VITE_ENV__: JSON.stringify({
        // Backend URL prefix - where to find /api/* endpoints
        // For local development: /api (dev proxy routes to localhost:3000)
        // For production: https://your-backend.vercel.app/api (full URL)
        BACKEND_URL: env.VITE_BACKEND_URL || '/api',
      }),
      __APP_BUILD_ID__: JSON.stringify(buildId),
      __APP_BUILD_TIME__: JSON.stringify(buildTime),
    },

    server: {
      // During local development, forward all /api/* calls to the Next.js API backend.
      // This proxy does NOT ship with production builds - it only works during dev.
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
      },
    },

    build: {
      outDir: 'build',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          main: 'index.html',
          login: 'login.html',
          signup: 'signup.html',
          dashboard: 'dashboard.html',
          whySpecDriven: 'why-spec-driven.html',
        },
      },
    },
  }
})
