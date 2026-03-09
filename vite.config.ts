import { defineConfig } from 'vite'

export default defineConfig({
  // Use relative asset paths so the app works under GitHub Pages subpaths.
  base: './',
  root: './',
  publicDir: 'public',
  build: {
    outDir: 'build',
    emptyOutDir: true,
  },
})
