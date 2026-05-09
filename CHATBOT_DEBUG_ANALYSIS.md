# Chatbot Deployment Failure: Root Cause Analysis

**Last Updated:** May 9, 2026  
**Status:** 🔴 CRITICAL - Chatbot non-functional on GitHub Pages

---

## 📋 Executive Summary

The chatbot fails on GitHub Pages deployment because:

1. **GitHub Pages serves only static files** (HTML, CSS, JS)
2. **The backend API `/api/chat` doesn't exist** on the static host
3. **Frontend makes POST requests to `/api/chat`** which returns 404
4. **The Vite dev proxy only works locally**, not in production builds
5. **API key is exposed** in `.env.example` (security risk)

---

## 🔍 Current Architecture

### Local Development ✅
```
User Browser
    ↓
Vite Dev Server (port 5173)
    ├── Serves static HTML/CSS/JS
    ├── Proxy Rule: /api/chat → localhost:3000
    └── Works because proxy bridges requests to Next.js

Next.js Dev Server (port 3000)
    ├── `/api/chat` endpoint
    ├── Loads `OPENAI_API_KEY` from `.env`
    └── Calls OpenAI API securely from backend
```

### GitHub Pages Deployment ❌
```
User Browser
    ↓
GitHub Pages (Static Files)
    ├── Serves built HTML/CSS/JS from /build/
    ├── NO backend server
    ├── NO Next.js
    ├── NO Vite proxy
    └── NO way to handle /api/chat requests

Frontend JavaScript
    ├── Makes POST request to /api/chat
    ├── Gets 404 Not Found (or CORS error)
    └── Chatbot fails
```

---

## ⚠️ Key Issues Identified

### Issue #1: Missing Backend on Deployment
- **Problem**: Frontend calls `/api/chat` endpoint
- **Why it fails**: GitHub Pages has no backend/API layer
- **Impact**: Every chat request fails with network error
- **Evidence**: File `ai-orchestration-nextjs/src/app/page.tsx` line 72 calls `fetch('/api/chat', {...})`

### Issue #2: Dev Proxy Not in Production Build
- **Problem**: `vite.config.ts` defines dev proxy for `/api/chat → localhost:3000`
- **Why it fails**: Dev proxies don't ship with production builds
- **Impact**: Production build has no way to route API calls
- **Evidence**: File `vite.config.ts` lines 8-13 - proxy only exists in dev server

### Issue #3: API Key Exposure Risk
- **Problem**: `OPENAI_API_KEY` exposed in `.env.example`
- **Why it's bad**: Real keys should never be in version control
- **Impact**: Risk of key theft, unauthorized API usage, cost overruns
- **Evidence**: File `.env.example` shows full OpenAI API key

### Issue #4: Relative API URL
- **Problem**: Frontend uses relative URL `/api/chat`
- **Why it fails**: No backend exists to handle this route
- **Impact**: API calls fail on any static host (GitHub Pages, Netlify static, etc.)

### Issue #5: No Environment Variable Strategy
- **Problem**: No way to configure API endpoint at build time
- **Why it fails**: Frontend code hardcodes `/api/chat`
- **Impact**: Can't point to different backends for dev/prod

---

## 🛠️ Solution Architecture

### Recommended: Backend Proxy Pattern

```
User Browser (GitHub Pages)
    ↓
Frontend JavaScript (index.html → /api/chat request)
    ↓ HTTPS/CORS
Separate Backend Server (Vercel/Netlify/Render)
    ├── Runs Node.js/Next.js
    ├── Endpoint: /api/chat
    ├── Loads OPENAI_API_KEY from server environment
    ├── Calls OpenAI API securely
    └── Returns response to frontend
    ↓
Response back to Browser
```

### Why This Works:
✅ GitHub Pages remains static - zero backend needed  
✅ API key stays on backend server - never exposed to client  
✅ Frontend can be deployed anywhere  
✅ Backend can be updated independently  
✅ Easy to scale or change API providers  

### Deployment Options:

| Platform | Cost | Effort | Best For |
|----------|------|--------|----------|
| **Vercel** | Free tier available | Low | Next.js apps (optimal) |
| **Netlify** | Free tier available | Medium | Any backend |
| **Render** | Paid ($7+/month) | Low | Any backend |
| **Railway** | Paid (~$5/month) | Low | Any backend |
| **Fly.io** | Free tier available | Medium | Scalable |

### Implementation Steps:

1. **Create `.env` with real API key** (not in version control)
2. **Deploy Next.js backend** to Vercel (easiest for Next.js)
3. **Update frontend API endpoint** to point to deployed backend
4. **Add CORS headers** on backend
5. **Test locally first** with dev proxy
6. **Deploy frontend** to GitHub Pages
7. **Verify end-to-end** in production

---

## 📊 Failure Timeline

| When | What | Status |
|------|------|--------|
| Local `npm run dev:all` | Both Vite + Next.js start | ✅ Works |
| Visit `http://localhost:5173` | Chat works via dev proxy | ✅ Works |
| `npm run build` | Vite builds to `/build/` | ✅ Builds |
| Push to GitHub | Files deployed to Pages | ✅ Deployed |
| Visit GitHub Pages URL | Chat fails on click | ❌ FAILS |

**Why Step 5 fails**: Built HTML has no proxy, tries to call `/api/chat`, gets 404

---

## 🔐 Security Issues

### Current State:
- ❌ API key in `.env.example` (exposed in git)
- ❌ Could be hardcoded in frontend if someone tries quick fix
- ❌ No way to rotate key without rebuilding frontend

### Fixed State:
- ✅ API key only on backend server
- ✅ Frontend never sees the key
- ✅ Key can be rotated by changing server env var
- ✅ No secrets in git history or client code

---

## ✅ Verification Checklist

- [ ] Backend deployed to Vercel/Netlify/Render
- [ ] Backend API returns valid responses at `https://backend-url.com/api/chat`
- [ ] CORS headers allow requests from GitHub Pages domain
- [ ] Frontend updated with correct API endpoint URL
- [ ] `.env.example` has placeholder key (not real key)
- [ ] `.env` is in `.gitignore`
- [ ] Local development works: `npm run dev:all`
- [ ] Production build works: `npm run build`
- [ ] Chat works on deployed GitHub Pages site
- [ ] Console shows no CORS errors
- [ ] Network tab shows successful POST to backend

---

## 🚀 Next Steps

See implementation files for:
1. Backend deployment guide
2. Frontend refactoring
3. Environment variable setup
4. Testing procedures
