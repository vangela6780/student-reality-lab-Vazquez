import { defineConfig } from 'vite'

export default defineConfig({
  // Use explicit GitHub Pages base so assets load reliably with or without trailing slash.
  base: '/student-reality-lab-Vazquez/',
  root: './',
  publicDir: 'public',
  build: {
    outDir: 'build',
    emptyOutDir: true,
  },
})
