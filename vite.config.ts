import { defineConfig } from 'vite'

export default defineConfig({
  // Use explicit GitHub Pages base so assets load reliably with or without trailing slash.
  base: '/student-reality-lab-Vazquez/',
  root: './',
  publicDir: 'public',
  server: {
    // During local development, forward chat calls to the Next.js API backend.
    proxy: {
      '/api/chat': {
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
})
