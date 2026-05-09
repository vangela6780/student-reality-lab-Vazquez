# Backend Deployment Guide - Vercel (Recommended)

## Why Vercel?

✅ **Optimal for Next.js** - Native support, zero-config  
✅ **Free tier** - Generously covers hobby projects  
✅ **Global CDN** - Fast responses worldwide  
✅ **Environment variables** - Secure secret storage built-in  
✅ **Instant deploys** - Connect GitHub, auto-deploy on push  
✅ **Easy rollback** - Previous versions available instantly  

---

## Step 1: Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your GitHub account

---

## Step 2: Set Up Environment Variables

### Option A: Create `.env.local` (for local testing)

```bash
# In repository root directory
# File: .env.local (NOT committed to git)

OPENAI_API_KEY=sk-... (your actual OpenAI API key)
```

**Add to `.gitignore`:**
```
.env.local
.env
```

### Option B: Set Environment Variables on Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add new variable:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: `sk-...` (your actual key)
   - **Scope**: Production, Preview, Development
5. Click "Save"

---

## Step 3: Update `ai-orchestration-nextjs/` for Vercel

### Verify `next.config.mjs`

```javascript
// ai-orchestration-nextjs/next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  // No special config needed for Vercel
  // Vercel auto-detects and optimizes Next.js projects
};

export default nextConfig;
```

### Verify `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,

    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "resolveJsonModule": true,
    "types": ["node"]
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

---

## Step 4: Deploy to Vercel

### Using Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# From repository root, deploy the Next.js app
cd ai-orchestration-nextjs
vercel deploy --prod

# You'll be asked:
# "Set up and deploy?" → yes
# "Which scope?" → your username
# "Link to existing project?" → no (first time)
# "Project name?" → "student-reality-lab-api" (or similar)
# "In which directory is your code?" → ./

# Output will show:
# ✓ Production: https://student-reality-lab-api.vercel.app
```

### Using GitHub Integration (Auto-Deploy)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. **Important**: 
   - Root Directory: `ai-orchestration-nextjs`
   - Framework Preset: Next.js
   - Build Command: `next build`
   - Output Directory: `.next`
5. Click "Add Environment Variables"
   - Add `OPENAI_API_KEY` with your actual key
6. Click "Deploy"

---

## Step 5: Verify Backend Deployment

### Test the API Endpoint

```bash
# Replace with your actual Vercel URL
curl -X POST https://student-reality-lab-api.vercel.app/api/simple-chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is spec-driven development?"}'

# Expected response:
# {"reply": "Spec-driven development is..."}
```

### Check in Browser

```javascript
// Open browser console and run:
fetch('https://your-vercel-url.vercel.app/api/simple-chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'Hello' })
})
.then(r => r.json())
.then(d => console.log(d))
```

---

## Step 6: Get Your Backend URL

After deployment, you'll have a URL like:
```
https://student-reality-lab-api.vercel.app
```

**Keep this URL - you'll use it in the next step!**

---

## Troubleshooting

### Build Fails: "Cannot find module 'next'"

```bash
cd ai-orchestration-nextjs
npm install
```

### API Returns 500 Error

1. Check Vercel Logs: Dashboard → Project → Deployments → Recent → Logs
2. Likely cause: `OPENAI_API_KEY` not set on Vercel
3. Fix: Go to Settings → Environment Variables → add the key

### CORS Error in Browser Console

The backend is working but frontend can't access it:

1. Check that backend URL is correct in frontend
2. Verify backend has CORS headers (it does by default)
3. Check browser console for exact error message

---

## Next Steps

After successful deployment:
1. **Note your Vercel URL**: `https://...vercel.app`
2. Go to [Frontend Setup Guide](./CHATBOT_FRONTEND_SETUP.md)
3. Update frontend with your backend URL
4. Deploy frontend to GitHub Pages

