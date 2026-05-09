# Frontend Setup Guide - GitHub Pages + Vite

## Architecture

```
GitHub Pages (Frontend)              Vercel/Netlify (Backend)
├── Vite-built static files    ←→   ├── Next.js API
├── index.html, login, etc.         ├── /api/chat endpoint
└── JavaScript makes requests        └── Returns chat responses
```

---

## Step 1: Update Frontend API Configuration

### Create Environment Variables for Frontend

Edit `.env.example` and verify it has:

```bash
# .env.example - commit this to git (placeholder values only)

# ⚠️ SECURITY: Store your real OPENAI_API_KEY in .env (not in git!)
# Never commit the real API key to version control
OPENAI_API_KEY=your-openai-api-key-here

# Frontend configuration
# For local development: use /api/chat (dev proxy)
# For production: use full backend URL (e.g., https://your-backend.com/api/chat)
VITE_CHAT_API_URL=/api/chat
VITE_BACKEND_URL=http://localhost:3000
```

Create `.env` (not committed to git):

```bash
# .env - DO NOT COMMIT (real keys only)

OPENAI_API_KEY=sk-... (your actual key for local testing)
VITE_CHAT_API_URL=/api/chat
VITE_BACKEND_URL=http://localhost:3000
```

Add to `.gitignore`:

```
.env
.env.local
.env.*.local
```

---

## Step 2: Update Frontend Code to Use Backend URL

We need to update the frontend JavaScript to:
1. Read the backend URL from environment variables
2. Use it for all API calls
3. Fall back to `/api/chat` for local dev (dev proxy)

### Update Main Frontend Build

Find where the chatbot makes API calls and ensure it uses the backend URL.

**Key file to check**: `src/main.ts` and related chat components

```typescript
// Get backend URL from environment or use local proxy for dev
const apiUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
const chatEndpoint = `${apiUrl}/api/chat`;

// Make request to backend
const response = await fetch(chatEndpoint, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: userMessage })
});
```

### Update Next.js Frontend (if using the AI orchestration app as frontend)

In `ai-orchestration-nextjs/src/app/page.tsx`, update the fetch call:

**Current** (line 72):
```typescript
const response = await fetch('/api/chat', {
```

**Updated** to support backend URL:
```typescript
// Get backend URL from environment
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
const endpoint = `${backendUrl}/api/chat`;

const response = await fetch(endpoint, {
```

Then add to `.env` (Next.js uses `NEXT_PUBLIC_` prefix):

```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
```

For production (on Vercel), set to your backend URL via environment variables.

---

## Step 3: Update Vite Config for Production

Update `vite.config.ts` to use environment variables:

```typescript
import { defineConfig } from 'vite'

export default defineConfig({
  base: '/student-reality-lab-Vazquez/',
  root: './',
  publicDir: 'public',
  
  // Environment-specific configuration
  define: {
    // Make backend URL available to frontend code
    __BACKEND_URL__: JSON.stringify(process.env.VITE_BACKEND_URL || '/api/chat'),
  },
  
  server: {
    // During local development, forward chat calls to the Next.js API backend
    proxy: {
      '/api/chat': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
      '/api/simple-chat': {
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
```

---

## Step 4: Test Locally

### Test with Dev Proxy (Local Backend)

```bash
# Terminal 1: Start Next.js backend
npm run dev:api

# Terminal 2: Start Vite frontend
npm run dev

# Open http://localhost:5173
# Chat should work via dev proxy
```

### Test with Production-like Setup

```bash
# Build both frontend and backend
npm run build
cd ai-orchestration-nextjs && npm run build && cd ..

# Simulate production (no proxy)
# Update .env to use full backend URL
VITE_BACKEND_URL=http://localhost:3000

# Rebuild frontend
npm run build

# Open build/index.html in browser and test chat
```

---

## Step 5: Deploy Frontend to GitHub Pages

### Update `package.json` Scripts

Ensure you have build and deploy scripts:

```json
{
  "scripts": {
    "dev": "vite --port 5173 --strictPort",
    "dev:api": "npm --prefix ai-orchestration-nextjs run dev -- --port 3000",
    "dev:all": "concurrently \"npm:dev\" \"npm:dev:api\"",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "deploy": "npm run build && git add build/ && git commit -m 'Deploy: build files' && git push"
  }
}
```

### Build and Commit

```bash
# Build production version
npm run build

# This creates /build/ directory with all static files

# Add to git
git add build/
git commit -m "chore: update production build with backend integration"
git push origin main
```

### Configure GitHub Pages

1. Go to GitHub Repository Settings
2. Scroll to "GitHub Pages" section
3. Select **Source**: `Deploy from a branch`
4. Select **Branch**: `main`
5. Select **Folder**: `/build`
6. Click "Save"

Your site will be available at:
```
https://vangela6780.github.io/student-reality-lab-Vazquez/
```

---

## Step 6: Update Backend CORS Settings (If Needed)

If you see CORS errors in browser console, update backend CORS headers.

In `ai-orchestration-nextjs/src/app/api/chat/route.ts`:

```typescript
export async function OPTIONS(req: Request) {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*', // or specific GitHub Pages URL
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
```

Redeploy backend after changes.

---

## Configuration Matrix

| Scenario | VITE_BACKEND_URL | How to Run |
|----------|------------------|-----------|
| **Local Dev** | `http://localhost:3000` | `npm run dev:all` |
| **Production** | `https://your-vercel-app.vercel.app` | `npm run build` then deploy |
| **Staging** | `https://staging-backend.vercel.app` | Build with env vars |

---

## Verification Checklist

- [ ] `.env` file created with backend URL
- [ ] `.env` added to `.gitignore`
- [ ] `.env.example` has placeholder values
- [ ] Frontend code uses `VITE_BACKEND_URL` or similar
- [ ] Vite config updated to use env variables
- [ ] Local development works: `npm run dev:all`
- [ ] Chat works on localhost:5173
- [ ] Production build created: `npm run build`
- [ ] `/build` directory has all static files
- [ ] GitHub Pages configured to serve from `/build`
- [ ] Frontend deployed to GitHub Pages
- [ ] Production build uses correct backend URL
- [ ] Chat works on GitHub Pages deployment
- [ ] No console errors or CORS issues

---

## Troubleshooting

### Chat fails with CORS error in console

1. Check network tab - see what URL frontend is calling
2. Verify backend URL matches in environment variables
3. Check backend has CORS headers (see Step 6)
4. Redeploy backend after CORS changes

### Chat fails with 404

1. Frontend is calling wrong URL (check network tab)
2. Backend URL not set correctly in environment
3. Backend `/api/chat` endpoint doesn't exist

### Works locally but fails on GitHub Pages

1. Build uses wrong backend URL
2. Check `npm run build` output
3. Verify `.env` file for production
4. Check browser network tab for actual URL being called

