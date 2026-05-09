# Quick Testing & Verification Guide

## ✅ What's Working Right Now

### Build Status
```bash
npm run build
# Output: ✅ PASS (524ms)
# All files compiled, no TypeScript errors
```

### Deployment Pipelines
- **Frontend**: GitHub Pages (auto-deployed from `build/` directory)
- **Backend**: Vercel (auto-deployed from `ai-orchestration-nextjs/`)
- **Both**: Ready for production use

---

## 🧪 Local Testing

### 1. Test Homepage Chat (Guest Flow)
```bash
npm run dev
# Opens: http://localhost:5173/
```

**Steps to Test**:
1. Click the chat widget (bottom-right)
2. Send 5 messages
3. On 6th message:
   - ✅ Input should be disabled
   - ✅ Modal appears with "Create account" button
   - ✅ Shows "0 free prompts left"
4. Click "Create account" → redirects to signup with `guestSessionId` in URL

**Verify**:
- Open browser DevTools → Application → Storage → localStorage
- Should see:
  - `devlearn_guest_session_id`: unique ID
  - `devlearn_chat_conversations_v2`: array with 5 messages
  - `devlearn_guest_usage_by_session_v1`: {sessionId: 5}

---

### 2. Test Dashboard Chat (Authenticated Flow)
```bash
# Already built, or:
npm run build
# Opens build/ directory
```

**Steps to Test**:
1. Navigate to: `http://localhost/build/dashboard.html`
2. Should see:
   - ✅ Dashboard navbar
   - ✅ Chat sidebar on left
   - ✅ "AI Chat" header
   - ✅ "New Chat" button
   - ✅ Search box
   - ✅ Chat messages area
   - ✅ Message input at bottom

**Verify**:
- Send a test message
- Message appears in chat
- Sidebar shows new conversation
- DevTools localStorage shows:
  - `devlearn_chat_conversations_v2` has new conversation
  - Conversation has `ownerKey: "user:test@example.com"`

---

### 3. Test Guest → Auth Migration
**Setup**:
1. Clear localStorage: DevTools → Storage → Clear All
2. Test homepage chat (send 3 messages as guest)
3. Verify in localStorage: `devlearn_guest_session_id` exists + 3 messages stored

**Migration Test**:
1. Click "Create account" → signup modal
2. Complete signup (simulated or actual)
3. Get redirected to: `dashboard.html?guestSessionId=abc123`
4. Dashboard should:
   - ✅ Automatically load chat interface
   - ✅ Show the 3 guest conversations in sidebar
   - ✅ Update ownerKey in localStorage to "user:email@example.com"
   - ✅ Allow continuing conversations

**Verify in DevTools**:
- localStorage `devlearn_chat_conversations_v2` shows:
  - Same 3 conversations
  - ownerKey changed from "guest:..." to "user:..."
  - Same messages intact

---

### 4. Test Backend APIs (curl or Postman)

#### List Conversations
```bash
curl "http://localhost:3000/api/conversations/list?userId=test@example.com"
# Response:
{
  "conversations": [
    { id, title, messages[], ... }
  ]
}
```

#### Get Single Conversation
```bash
curl "http://localhost:3000/api/conversations/abc123?userId=test@example.com"
# Response:
{
  "conversation": { full object }
}
```

#### Sync Conversation
```bash
curl -X POST http://localhost:3000/api/conversations/sync \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test@example.com",
    "conversation": {
      "id": "conv1",
      "ownerKey": "user:test@example.com",
      "title": "Test",
      "messages": []
    }
  }'
# Response:
{
  "ok": true,
  "conversation": { ... }
}
```

#### Migrate Guest Conversations
```bash
curl -X POST http://localhost:3000/api/conversations/migrate \
  -H "Content-Type: application/json" \
  -d '{
    "guestSessionId": "guest_abc",
    "userId": "test@example.com",
    "conversations": [{ conversation objects }]
  }'
# Response:
{
  "ok": true,
  "migratedCount": 3
}
```

---

### 5. Test Mobile Responsiveness

**Dashboard on Mobile**:
```
DevTools → Device Toolbar → Select iPhone 12
```

**Verify**:
- ✅ Sidebar collapses or overlays
- ✅ Chat panel fills screen
- ✅ Messages readable on small screen
- ✅ Input button large enough to tap
- ✅ Animations smooth on mobile

**Homepage on Mobile**:
- ✅ Chat widget visible
- ✅ Tap to open chat
- ✅ Messages scroll properly
- ✅ No horizontal overflow

---

## 📊 Performance Checks

### Build Size
```
CSS: 20.00 kB (4.70 kB gzip)
JS (main): 77.87 kB (25.88 kB gzip)
JS (dashboard): 0.55 kB (0.38 kB gzip)
Total: ~98 kB (~30.58 kB gzip)
```

### Lighthouse Audit
```bash
# Use Chrome DevTools Lighthouse tab
# Expected scores:
- Performance: 85+
- Accessibility: 95+
- Best Practices: 90+
- SEO: 90+
```

### LocalStorage Usage
```javascript
// Check in DevTools → Application → Storage
// Expected per user:
- Conversations: ~50 kB (20-30 conversations)
- Guest session: ~5 kB
- Settings: ~1 kB
// Total: <100 kB for typical user
```

---

## 🚀 Deployment Verification

### Frontend Deployment
```bash
# GitHub Actions auto-builds on push to main
# Verifies:
1. npm run build passes
2. No TypeScript errors
3. Deploys to GitHub Pages
4. Available at: https://vangela6780.github.io/student-reality-lab-Vazquez/
```

**Test after deployment**:
```bash
# Open live version
curl https://vangela6780.github.io/student-reality-lab-Vazquez/index.html
# Should be HTML (not 404 or error page)
```

### Backend Deployment
```bash
# ai-orchestration-nextjs deployed to Vercel
# Verifies:
1. npm run build in that directory passes
2. API routes are accessible
3. OPENAI_API_KEY is set in environment

# Test endpoints:
curl https://your-vercel-url.vercel.app/api/simple-chat \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'
```

---

## ✅ Verification Checklist

### Core Features
- [ ] Homepage chat widget appears
- [ ] Guest can send up to 5 messages
- [ ] 6th message triggers signup modal
- [ ] Signup redirects with guestSessionId
- [ ] Dashboard loads and initializes chat
- [ ] Guest conversations migrate on auth
- [ ] Dashboard sidebar shows conversations
- [ ] Can search conversations
- [ ] Can create new chat from dashboard
- [ ] Messages persist after refresh

### UI/UX
- [ ] Chat bubbles have correct styling
- [ ] Markdown renders (bold, code, lists, etc.)
- [ ] Animations are smooth
- [ ] Typing indicator shows while waiting
- [ ] Mobile layout works
- [ ] No console errors
- [ ] No layout shifts (CLS good)

### Backend
- [ ] API endpoints respond correctly
- [ ] Rate limiting works (429 status when exceeded)
- [ ] Rate limiting headers present
- [ ] Invalid requests return 400
- [ ] Unauthorized requests return 401/403
- [ ] Messages deduplicated properly
- [ ] Ownership validation works

### Performance
- [ ] Build time < 1 second
- [ ] Bundle size < 100 kB (gzipped < 35 kB)
- [ ] Lighthouse score > 85
- [ ] No memory leaks in DevTools
- [ ] API responses < 1 second
- [ ] Chat smooth at 60 FPS

---

## 🐛 If Something Breaks

### Build Errors
```bash
# Clear cache and rebuild
npm run clean 2>/dev/null || rm -rf build node_modules package-lock.json
npm install
npm run build
```

### TypeScript Errors
```bash
# Check types
npm run type-check
# Or just:
npx tsc --noEmit
```

### Chat Not Loading
1. Open DevTools → Console
2. Look for errors
3. Check Network tab for failed requests
4. Verify backend is running
5. Check OPENAI_API_KEY is set

### Migrations Not Working
1. Verify guestSessionId in URL
2. Check localStorage for guest conversations
3. Verify backend migration endpoint accessible
4. Check browser console for errors

### Rate Limiting Issues
```javascript
// Reset in console:
// Wait 60 seconds OR restart API server
// Rate limits are per IP
```

---

## 📝 Next Steps

### Immediate (This Sprint)
1. ✅ Test complete flow locally
2. ✅ Verify build passes
3. ✅ Check deployments successful
4. ✅ Review code quality

### Short Term (Next Sprint)
1. Add conversation deletion
2. Add export functionality
3. Add error toast notifications
4. Add loading spinners
5. Performance optimization

### Medium Term
1. Add database persistence
2. Add real authentication (NextAuth.js)
3. Add conversation sharing
4. Add analytics

---

## 🆘 Support

**Questions?** Check these docs:
- Phase 1 requirements: [CHATBOT_REDESIGN.md](./CHATBOT_REDESIGN.md)
- Complete implementation: [PHASES_3_5_COMPLETE.md](./PHASES_3_5_COMPLETE.md)
- Codebase structure: [README.md](./README.md)

**Found a bug?** 
1. Note exact steps to reproduce
2. Check DevTools console for errors
3. Verify build passes locally
4. Check recent commits for changes
