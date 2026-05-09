# Complete Deployment Guide - End-to-End

This guide walks you through deploying the chatbot system securely and reliably.

---

## 📋 Prerequisites

- GitHub account (for version control and Pages hosting)
- Vercel account (for backend deployment) - free tier works
- OpenAI API key - get from https://platform.openai.com/api-keys

---

## 🚀 Part 1: Local Setup

### Step 1.1: Create `.env` file with your API key

```bash
# Create file: .env (DO NOT COMMIT TO GIT)
OPENAI_API_KEY=sk-...your-actual-key-here...
VITE_BACKEND_URL=/api/chat
```

**Important**: 
- Never commit `.env` to git (add to `.gitignore`)
- Use placeholder in `.env.example` only
- Real keys stay local or on server only

### Step 1.2: Test locally with dev proxy

```bash
# Terminal 1: Start Next.js backend (will use .env for OPENAI_API_KEY)
npm run dev:api

# Terminal 2: Start Vite frontend with dev proxy
npm run dev

# Open http://localhost:5173 in browser
# Click the chat button and test a message
```

**Expected result**: Chat works, message is processed, response appears

**If it fails:**
- Check `.env` has valid OPENAI_API_KEY
- Check both terminals are running
- Check browser console for errors
- Check network tab for failed requests

---

## 🚀 Part 2: Deploy Backend to Vercel

### Step 2.1: Prepare backend

```bash
cd ai-orchestration-nextjs

# Verify it builds
npm run build

# Check no errors
npm run lint

cd ..
```

### Step 2.2: Create Vercel account and deploy

**Option A: Using Vercel CLI**

```bash
npm install -g vercel

vercel login

cd ai-orchestration-nextjs

vercel deploy --prod

# You'll be asked several questions:
# "Set up and deploy?" → yes
# "Link to existing project?" → no (first time)
# "What's your project name?" → student-reality-lab-api
# "In which directory is your code?" → ./
# "Want to modify anything?" → no

# Output will show URL like:
# Production: https://student-reality-lab-api.vercel.app
```

**Option B: Using Vercel Dashboard + GitHub**

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. **Root Directory**: `ai-orchestration-nextjs`
5. Add environment variable: `OPENAI_API_KEY` = your key
6. Click "Deploy"

### Step 2.3: Set environment variables on Vercel

**If not set during deploy**, go to:

1. Vercel Dashboard
2. Your project → Settings
3. Environment Variables
4. Add: `OPENAI_API_KEY` = sk-...
5. Scope: Production, Preview, Development

### Step 2.4: Test backend deployment

```bash
# Replace with your actual Vercel URL
curl -X POST https://student-reality-lab-api.vercel.app/api/simple-chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is spec-driven development?"}'

# Expected response:
# {"reply": "Spec-driven development..."}
```

**Save your backend URL** - you'll need it next!

---

## 🚀 Part 3: Update Frontend with Backend URL

### Step 3.1: Create `.env` with production backend URL

Create or update `.env` in repository root:

```bash
# .env (DO NOT COMMIT)
OPENAI_API_KEY=sk-...your-key...
VITE_BACKEND_URL=https://student-reality-lab-api.vercel.app
```

This tells Vite where to send chat requests:
- **Local dev** (if using /api/chat): Goes through Vite proxy to localhost:3000
- **Production build** (if using full URL): Goes directly to Vercel backend

### Step 3.2: Verify frontend code uses environment variables

The frontend should now use `window.__VITE_ENV__.BACKEND_URL` from vite.config.ts.

**Check** [index.html](index.html) around line 248:
```javascript
// This should now read from VITE_BACKEND_URL environment variable:
const backendUrl = (window.__VITE_ENV__?.BACKEND_URL || '/api/chat').replace(/\/$/, '');
```

---

## 🚀 Part 4: Test Production Build Locally

### Step 4.1: Build production version

```bash
# Build Vite frontend
npm run build

# This creates /build/ directory with all static files
# These files are what GitHub Pages will serve
```

### Step 4.2: Test build with local server

```bash
# Install simple HTTP server (if not already installed)
npm install -g http-server

# Serve the build directory locally
cd build
http-server -p 8080

# Open http://localhost:8080
# Test the chat - it should now call your Vercel backend
```

**Expected result**: Chat works, calling `https://student-reality-lab-api.vercel.app/api/simple-chat`

**If it fails**:
- Check network tab - what URL is it calling?
- Should be your backend URL, not `/api/chat`
- Check `.env` has correct `VITE_BACKEND_URL`
- Rebuild: `npm run build`

---

## 🚀 Part 5: Deploy Frontend to GitHub Pages

### Step 5.1: Commit code changes

```bash
# Verify .env is in .gitignore
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore

# Add built files
git add build/
git add .env.example
git add vite.config.ts
git add index.html
git add .gitignore

# Commit
git commit -m "fix: chatbot backend integration for GitHub Pages deployment

- Add Vite environment variable injection
- Replace hardcoded API URLs with configurable backend URL
- Update frontend to use VITE_BACKEND_URL from .env
- Security: Never expose API key in frontend code
- Local dev uses /api/chat (dev proxy), production uses full URL"

# Push to GitHub
git push origin main
```

### Step 5.2: Configure GitHub Pages

1. Go to your GitHub repository
2. Settings → Pages
3. **Source**: Deploy from a branch
4. **Branch**: main
5. **Folder**: /build
6. Click Save

Your site will be available at:
```
https://vangela6780.github.io/student-reality-lab-Vazquez/
```

**Wait 1-2 minutes for deployment, then test!**

---

## ✅ Final Verification

### Test Production Deployment

1. Open https://vangela6780.github.io/student-reality-lab-Vazquez/
2. Scroll to chat section
3. Click chat toggle button
4. Type a message: "What is spec-driven development?"
5. Click Send
6. Wait for response

### Check Network Requests

1. Open Browser DevTools (F12)
2. Go to Network tab
3. Send a chat message
4. Look for POST request to:
   - **Should be**: `https://student-reality-lab-api.vercel.app/api/simple-chat`
   - **Should NOT be**: `/api/chat` or `/api/simple-chat` (relative URLs)
5. Response should show `{"reply": "..."}`

### Check Console for Errors

1. DevTools → Console
2. Send a chat message
3. Should see no red errors
4. May see cors/security warnings - these are OK for localhost testing

---

## 🔍 Troubleshooting

### Chat still fails on GitHub Pages

**Check network tab - what URL is it calling?**

- If calling `/api/chat` → Backend URL not set correctly
  - Verify `.env` has `VITE_BACKEND_URL=https://...`
  - Rebuild: `npm run build`
  - Git push changes to `/build`

- If calling correct URL but 404 → Backend endpoint doesn't exist
  - Test backend directly: `curl https://backend/api/simple-chat -X POST -H "Content-Type: application/json" -d '{"message":"hi"}'`
  - Check backend is deployed on Vercel
  - Check endpoint is `/api/simple-chat` not something else

- If calling correct URL but CORS error → CORS headers missing
  - Backend already has CORS headers (ai-orchestration-nextjs/src/app/api/simple-chat/route.ts)
  - May need to redeploy backend if you modified it
  - Try incognito window to test

- If calling correct URL but 500 error → Backend error
  - Check Vercel logs: Dashboard → Project → Deployments → Logs
  - Likely cause: `OPENAI_API_KEY` not set on Vercel
  - Fix: Go to Vercel → Settings → Environment Variables → add key

### Works locally but not on GitHub Pages

- Local dev uses proxy, production uses full URL
- Check that .env has `VITE_BACKEND_URL=https://...`
- Production build strips dev proxy
- Run `npm run build` to create production version
- Test build locally first: `cd build && http-server -p 8080`

### Can't find my backend URL

- During Vercel deploy, look for "Production: https://..."
- Or check Vercel Dashboard → Project → Deployments → latest
- Format should be: `https://your-project.vercel.app`

### API key keeps getting exposed

- Never commit `.env` to git
- Add `.env` to `.gitignore`
- Use `.env.example` with placeholder values only
- If real key was committed, Vercel dashboard will warn you
- Rotate the key immediately (revoke and create new one)

---

## 📊 Architecture Summary

```
User's Browser (GitHub Pages)
    ↓
Frontend JavaScript (index.html)
    Reads VITE_BACKEND_URL from environment
    ↓
HTTPS POST to Vercel Backend
    ↓
Vercel Next.js Server (/api/simple-chat)
    Reads OPENAI_API_KEY from server environment
    ↓
OpenAI API (secure, server-to-server)
    ↓
Response flows back through layers
```

**Security Properties:**
✅ API key never exposed to client  
✅ Frontend never sees secrets  
✅ Backend URL is configurable  
✅ Can rotate keys without rebuilding frontend  
✅ Different backends for dev/staging/prod  

---

## 🎉 Success Criteria

- [ ] Chat works on http://localhost:5173 during `npm run dev:all`
- [ ] Chat works on production build at http://localhost:8080 (test build locally)
- [ ] Chat works on GitHub Pages deployment
- [ ] Network requests go to correct backend URL
- [ ] No CORS or 404 errors in production
- [ ] `.env` file is NOT committed to git
- [ ] `.env.example` has placeholder values only
- [ ] Can update backend URL by changing `.env` before build

---

## 🚨 Important Reminders

1. **Never commit `.env`** - only `.env.example`
2. **Never hardcode API keys** - use environment variables
3. **Test locally first** - before deploying to GitHub Pages
4. **Redeploy backend** - if you make code changes
5. **Restart dev servers** - after changing `.env`

