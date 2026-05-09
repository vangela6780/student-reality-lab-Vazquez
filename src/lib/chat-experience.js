import DOMPurify from 'dompurify';
import { marked } from 'marked';

marked.setOptions({
  gfm: true,
  breaks: true,
  mangle: false,
  headerIds: false,
});

const STORAGE_KEYS = {
  guestSessionId: 'devlearn_guest_session_id',
  conversations: 'devlearn_chat_conversations_v2',
  activeByOwner: 'devlearn_chat_active_by_owner_v2',
  guestUsageBySession: 'devlearn_guest_usage_by_session_v1',
};

const DEFAULT_GUEST_LIMIT = 5;
const DEFAULT_API_BASE = 'https://ai-orchestration-nextjs.vercel.app/api';
const WELCOME_MESSAGE = "Hello. I am your DevLearn assistant. Ask me about specifications, testing, or delivery planning.";

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function createId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`;
}

function formatTime(iso) {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function escapeHtml(text) {
  const p = document.createElement('p');
  p.textContent = text;
  return p.innerHTML;
}

function markdownToSafeHtml(text) {
  const rawHtml = marked.parse(text || '');
  return DOMPurify.sanitize(rawHtml, {
    USE_PROFILES: { html: true },
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel|data):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
  });
}

function getBackendBase() {
  const metaValue = document.querySelector('meta[name="backend-url"]')?.getAttribute('content') || '';
  const unresolved = !metaValue || metaValue.includes('%VITE_BACKEND_URL%');
  const local = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const fallback = local ? '/api' : DEFAULT_API_BASE;
  return (unresolved ? fallback : metaValue).replace(/\/$/, '');
}

function showErrorNotification(message, duration = 5000) {
  // Remove existing notifications
  const existing = document.querySelector('.error-notification');
  if (existing) existing.remove();

  const notification = document.createElement('div');
  notification.className = 'error-notification';
  notification.innerHTML = `
    <div class="error-notification-content">
      <strong>⚠️ Error:</strong> ${escapeHtml(message)}
      <button type="button" class="error-notification-close">×</button>
    </div>
  `;

  notification.querySelector('.error-notification-close')?.addEventListener('click', () => {
    notification.remove();
  });

  document.body.appendChild(notification);

  if (duration > 0) {
    setTimeout(() => {
      notification.classList.add('error-notification-fade');
      setTimeout(() => notification.remove(), 300);
    }, duration);
  }

  return notification;
}

function getGuestSessionId() {
  let id = localStorage.getItem(STORAGE_KEYS.guestSessionId);
  if (!id) {
    id = createId('guest');
    localStorage.setItem(STORAGE_KEYS.guestSessionId, id);
  }
  return id;
}

function getAuthState() {
  const isLoggedIn = localStorage.getItem('is_logged_in') === 'true';
  const email = (localStorage.getItem('user_email') || '').trim().toLowerCase();
  const name = (localStorage.getItem('user_name') || '').trim();
  return {
    isLoggedIn: Boolean(isLoggedIn && email),
    userEmail: email,
    userName: name || 'Learner',
  };
}

function getOwnerKey() {
  const auth = getAuthState();
  if (auth.isLoggedIn) {
    return `user:${auth.userEmail}`;
  }
  return `guest:${getGuestSessionId()}`;
}

function loadConversations() {
  const conversations = readJson(STORAGE_KEYS.conversations, []);
  return Array.isArray(conversations) ? conversations : [];
}

function saveConversations(conversations) {
  writeJson(STORAGE_KEYS.conversations, conversations);
}

function getActiveByOwner() {
  return readJson(STORAGE_KEYS.activeByOwner, {});
}

function setActiveConversationId(ownerKey, conversationId) {
  const activeByOwner = getActiveByOwner();
  activeByOwner[ownerKey] = conversationId;
  writeJson(STORAGE_KEYS.activeByOwner, activeByOwner);
}

function getConversationTitle(messages) {
  const firstUser = messages.find((message) => message.role === 'user');
  if (!firstUser) return 'New Conversation';
  const plain = firstUser.content.replace(/\s+/g, ' ').trim();
  if (!plain) return 'New Conversation';
  return plain.slice(0, 56) + (plain.length > 56 ? '...' : '');
}

function ensureConversation(ownerKey) {
  const conversations = loadConversations();
  const activeByOwner = getActiveByOwner();
  const activeId = activeByOwner[ownerKey];

  let conversation = conversations.find((item) => item.ownerKey === ownerKey && item.id === activeId);

  if (!conversation) {
    conversation = {
      id: createId('conv'),
      ownerKey,
      title: 'New Conversation',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: createId('msg'),
          role: 'assistant',
          content: WELCOME_MESSAGE,
          createdAt: new Date().toISOString(),
        },
      ],
    };
    conversations.push(conversation);
    saveConversations(conversations);
    setActiveConversationId(ownerKey, conversation.id);
  }

  return conversation;
}

function updateConversation(nextConversation) {
  const conversations = loadConversations();
  const index = conversations.findIndex((item) => item.id === nextConversation.id && item.ownerKey === nextConversation.ownerKey);
  if (index >= 0) {
    conversations[index] = nextConversation;
  } else {
    conversations.push(nextConversation);
  }
  saveConversations(conversations);
}

function createMessage(role, content) {
  return {
    id: createId('msg'),
    role,
    content,
    createdAt: new Date().toISOString(),
  };
}

function getGuestUsage() {
  const sessionId = getGuestSessionId();
  const usageBySession = readJson(STORAGE_KEYS.guestUsageBySession, {});
  return Number(usageBySession[sessionId] || 0);
}

function incrementGuestUsage() {
  const sessionId = getGuestSessionId();
  const usageBySession = readJson(STORAGE_KEYS.guestUsageBySession, {});
  usageBySession[sessionId] = Number(usageBySession[sessionId] || 0) + 1;
  writeJson(STORAGE_KEYS.guestUsageBySession, usageBySession);
  return usageBySession[sessionId];
}

// Returns true if the current page is a protected/auth page that should never be
// redirect-looped (login, signup, dashboard).
function isProtectedPage() {
  return /\/(login|signup|dashboard)\.html(\?|#|$)?/.test(window.location.pathname);
}

// Safe redirect with loop protection: tracks redirect count in sessionStorage.
// If too many redirects happen in a short window, bail out to the home page.
function safeRedirect(url) {
  const MAX_REDIRECTS = 3;
  const RESET_MS = 5000;
  const now = Date.now();

  const raw = sessionStorage.getItem('_redirect_guard');
  let guard = { count: 0, ts: now };
  try {
    if (raw) guard = JSON.parse(raw);
  } catch { /* ignore */ }

  // Reset counter if last redirect was more than RESET_MS ago
  if (now - guard.ts > RESET_MS) {
    guard = { count: 0, ts: now };
  }

  guard.count += 1;
  guard.ts = now;

  if (guard.count > MAX_REDIRECTS) {
    // Too many redirects — clear guard and fall back to home page
    sessionStorage.removeItem('_redirect_guard');
    window.location.replace('./index.html');
    return;
  }

  sessionStorage.setItem('_redirect_guard', JSON.stringify(guard));
  window.location.href = url;
}

function createAuthLinks() {
  // Strip existing auth params before encoding to prevent recursive returnTo nesting
  const params = new URLSearchParams(window.location.search);
  params.delete('returnTo');
  params.delete('guestSessionId');
  const cleanSearch = params.toString() ? '?' + params.toString() : '';

  // Use only the pathname (never the full href) to stop recursive encoding
  const cleanUrl = window.location.pathname + cleanSearch;

  // If already on login/signup/dashboard, fall back to homepage
  const destination = isProtectedPage() ? './index.html' : cleanUrl;

  const returnTo = encodeURIComponent(destination);
  const guestSessionId = encodeURIComponent(getGuestSessionId());
  return {
    login: `./login.html?returnTo=${returnTo}&guestSessionId=${guestSessionId}`,
    signup: `./signup.html?returnTo=${returnTo}&guestSessionId=${guestSessionId}`,
  };
}

async function syncConversationToBackend(apiBase, ownerKey, conversation) {
  if (!ownerKey.startsWith('user:')) return;

  const userId = ownerKey.replace('user:', '');
  try {
    const response = await fetch(`${apiBase}/conversations/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, conversation }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      const error = payload.error || `Server error (${response.status})`;
      console.warn('[Sync] Backend sync failed:', error, 'Local data retained.');
      // Silently continue - local data is authoritative
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.warn('[Sync] Network error during backend sync:', message);
    // Silently continue - local data is authoritative
  }
}

function sortByUpdatedAtDesc(conversations) {
  return [...conversations].sort((a, b) => {
    const aTime = new Date(a.updatedAt).getTime();
    const bTime = new Date(b.updatedAt).getTime();
    return bTime - aTime;
  });
}

function renderMessageNode(message) {
  const row = document.createElement('div');
  row.className = `chat-row chat-row-${message.role}`;

  const bubble = document.createElement('div');
  bubble.className = `chat-bubble chat-bubble-${message.role}`;

  if (message.role === 'assistant') {
    bubble.innerHTML = `<div class="chat-markdown">${markdownToSafeHtml(message.content)}</div>`;
  } else {
    bubble.innerHTML = `<div class="chat-plain">${escapeHtml(message.content)}</div>`;
  }

  const meta = document.createElement('div');
  meta.className = 'chat-meta';
  const roleLabel = message.role === 'assistant' ? 'Assistant' : 'You';
  meta.textContent = `${roleLabel} • ${formatTime(message.createdAt)}`;

  row.appendChild(bubble);
  row.appendChild(meta);
  return row;
}

function renderTypingIndicator() {
  const row = document.createElement('div');
  row.className = 'chat-row chat-row-assistant';
  row.innerHTML = `
    <div class="chat-bubble chat-bubble-assistant">
      <div class="chat-typing">
        <span></span><span></span><span></span>
      </div>
    </div>
    <div class="chat-meta">Assistant • typing...</div>
  `;
  return row;
}

function renderStarterPrompts(prompts, onPick) {
  const wrap = document.createElement('div');
  wrap.className = 'chat-starter-wrap';
  wrap.innerHTML = `
    <p class="chat-starter-title">Try one of these prompts</p>
    <div class="chat-starter-grid"></div>
  `;

  const grid = wrap.querySelector('.chat-starter-grid');
  prompts.forEach((prompt) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'chat-starter-btn';
    button.textContent = prompt;
    button.addEventListener('click', () => onPick(prompt));
    grid.appendChild(button);
  });

  return wrap;
}

function attachAuthModal(options) {
  const links = createAuthLinks();
  const modal = document.createElement('div');
  modal.className = 'chat-auth-modal hidden';
  modal.innerHTML = `
    <div class="chat-auth-card">
      <h3>Continue with an account</h3>
      <p>You reached the free guest prompt limit. Sign up to save chats across devices and continue the same conversation.</p>
      <div class="chat-auth-actions">
        <a class="chat-auth-btn primary" href="${links.signup}">Create account</a>
        <a class="chat-auth-btn" href="${links.login}">Log in</a>
      </div>
      <button type="button" class="chat-auth-dismiss">Not now</button>
    </div>
  `;

  options.host.appendChild(modal);
  modal.querySelector('.chat-auth-dismiss')?.addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  return {
    show() {
      modal.classList.remove('hidden');
    },
    hide() {
      modal.classList.add('hidden');
    },
  };
}

function createChatController(options) {
  const apiBase = getBackendBase();
  const ownerKey = getOwnerKey();
  let conversation = ensureConversation(ownerKey);
  let loading = false;

  const authModal = attachAuthModal({ host: options.modalHost || document.body });

  function refreshUsageState() {
    const auth = getAuthState();
    const used = auth.isLoggedIn ? 0 : getGuestUsage();
    const remaining = auth.isLoggedIn ? null : Math.max(0, options.guestLimit - used);

    if (options.usageLabel) {
      options.usageLabel.textContent = auth.isLoggedIn
        ? `Signed in as ${auth.userName}`
        : `${remaining} free prompts left`;
    }

    const blocked = !auth.isLoggedIn && remaining === 0;
    if (blocked && options.redirectOnGuestLimit) {
      // Do not hard-redirect from the homepage when a guest reaches the limit.
      // Keep the page usable and let the user choose login/signup from the modal.
      return blocked;
    }

    if (options.input) options.input.disabled = blocked || loading;
    if (options.sendButton) {
      options.sendButton.disabled = blocked || loading;
      options.sendButton.textContent = loading ? 'Sending...' : 'Send';
    }
    options.chatShell?.classList.toggle('chat-locked', blocked);
    return blocked;
  }

  function renderMessages(showTyping = false) {
    if (!options.messagesWrap) return;
    options.messagesWrap.innerHTML = '';

    conversation.messages.forEach((message) => {
      options.messagesWrap.appendChild(renderMessageNode(message));
    });

    const showStarterPrompts = !showTyping
      && Array.isArray(options.starterPrompts)
      && options.starterPrompts.length > 0
      && conversation.messages.length <= 1;

    if (showStarterPrompts) {
      options.messagesWrap.appendChild(renderStarterPrompts(options.starterPrompts, sendMessage));
    }

    if (showTyping) {
      options.messagesWrap.appendChild(renderTypingIndicator());
    }

    options.messagesWrap.scrollTop = options.messagesWrap.scrollHeight;
  }

  function saveConversation() {
    conversation.updatedAt = new Date().toISOString();
    conversation.title = getConversationTitle(conversation.messages);
    updateConversation(conversation);
    setActiveConversationId(conversation.ownerKey, conversation.id);
    options.onConversationSaved?.(conversation);
  }

  async function sendMessage(text) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const blocked = refreshUsageState();
    if (blocked) {
      authModal.show();
      return;
    }

    const auth = getAuthState();
    if (!auth.isLoggedIn) {
      incrementGuestUsage();
    }

    loading = true;
    refreshUsageState();

    conversation.messages.push(createMessage('user', trimmed));
    saveConversation();
    renderMessages(true);

    try {
      const response = await fetch(`${apiBase}/simple-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          conversationId: conversation.id,
          guestSessionId: getGuestSessionId(),
          userId: auth.isLoggedIn ? auth.userEmail : null,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const errorMsg = payload.error || `Server error (${response.status})`;
        throw new Error(errorMsg);
      }

      const reply = String(payload.reply || 'No response from AI.');
      conversation.messages.push(createMessage('assistant', reply));
      saveConversation();
      await syncConversationToBackend(apiBase, conversation.ownerKey, conversation);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown chat error';
      showErrorNotification(message, 6000);
      // Remove the failed user message - don't save it since we couldn't get a response
      conversation.messages.pop();
      saveConversation();
    } finally {
      loading = false;
      renderMessages();
      refreshUsageState();
    }
  }

  function bindInput() {
    options.sendButton?.addEventListener('click', () => {
      const value = options.input?.value || '';
      options.input.value = '';
      sendMessage(value);
    });

    options.input?.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        const value = options.input?.value || '';
        options.input.value = '';
        sendMessage(value);
      }
    });
  }

  function loadConversation(conversationId) {
    const conversations = loadConversations();
    const next = conversations.find((item) => item.id === conversationId && item.ownerKey === ownerKey);
    if (!next) return;
    conversation = next;
    setActiveConversationId(ownerKey, conversation.id);
    renderMessages();
    options.onConversationSelected?.(conversation);
  }

  function createNewConversation() {
    conversation = {
      id: createId('conv'),
      ownerKey,
      title: 'New Conversation',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [createMessage('assistant', WELCOME_MESSAGE)],
    };
    saveConversation();
    renderMessages();
    options.onConversationSelected?.(conversation);
  }

  function listConversations(searchQuery = '') {
    const query = searchQuery.trim().toLowerCase();
    const ownerConversations = loadConversations().filter((item) => item.ownerKey === ownerKey);
    const sorted = sortByUpdatedAtDesc(ownerConversations);
    return sorted.filter((item) => {
      if (!query) return true;
      return item.title.toLowerCase().includes(query);
    });
  }

  bindInput();
  renderMessages();
  refreshUsageState();

  return {
    sendMessage,
    refreshUsageState,
    listConversations,
    loadConversation,
    createNewConversation,
    getCurrentConversation: () => conversation,
  };
}

function attachHomeUi(controller) {
  // placeholder hook for future homepage-specific events
  controller.refreshUsageState();
}

export function initHomeChatWidget() {
  // Guard: never run the home chat widget (with its redirect logic) on auth or
  // dashboard pages. Those pages have their own controllers or no chat at all.
  if (isProtectedPage()) return;

  const chatPanel = document.getElementById('chat-panel');
  const chatToggle = document.getElementById('chat-toggle');
  const chatClose = document.getElementById('chat-close');

  // If there's no chat panel in the page, skip entirely — no widget to attach.
  if (!chatPanel) return;

  // Clear redirect-loop guard: user successfully loaded the page
  sessionStorage.removeItem('_redirect_guard');

  const controller = createChatController({
    guestLimit: DEFAULT_GUEST_LIMIT,
    redirectOnGuestLimit: true,
    chatShell: chatPanel,
    modalHost: document.body,
    messagesWrap: document.getElementById('chat-messages'),
    usageLabel: document.getElementById('chat-usage-label'),
    input: document.getElementById('chat-input'),
    sendButton: document.getElementById('chat-send'),
    starterPrompts: [
      'Give me a simple project specification template.',
      'Turn this idea into user stories and acceptance criteria.',
      'What should my MVP include for a student dashboard?',
    ],
  });

  chatToggle?.addEventListener('click', () => chatPanel?.classList.toggle('hidden'));
  chatClose?.addEventListener('click', () => chatPanel?.classList.add('hidden'));

  attachHomeUi(controller);
}

function renderConversationList(container, conversations, activeId, onSelect) {
  container.innerHTML = '';

  if (conversations.length === 0) {
    container.innerHTML = '<p class="assistant-empty">No conversations yet.</p>';
    return;
  }

  conversations.forEach((conversation) => {
    const lastMessage = conversation.messages?.[conversation.messages.length - 1];
    const preview = (lastMessage?.content || 'Start a new conversation')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 78);

    const button = document.createElement('button');
    button.type = 'button';
    button.className = `assistant-thread ${conversation.id === activeId ? 'active' : ''}`;
    button.innerHTML = `
      <strong>${escapeHtml(conversation.title || 'New Conversation')}</strong>
      <em class="assistant-thread-preview">${escapeHtml(preview)}${preview.length >= 78 ? '...' : ''}</em>
      <span>${formatTime(conversation.updatedAt)}</span>
    `;
    button.addEventListener('click', () => onSelect(conversation.id));
    container.appendChild(button);
  });
}

export function initDashboardAssistant() {
  const shell = document.getElementById('dashboard-assistant');
  if (!shell) return;

  const conversationList = document.getElementById('assistant-conversation-list');
  const searchInput = document.getElementById('assistant-search');
  const newButton = document.getElementById('assistant-new-chat');

  const controller = createChatController({
    guestLimit: DEFAULT_GUEST_LIMIT,
    chatShell: shell,
    modalHost: shell,
    messagesWrap: document.getElementById('dashboard-chat-messages'),
    usageLabel: document.getElementById('dashboard-chat-usage'),
    input: document.getElementById('dashboard-chat-input'),
    sendButton: document.getElementById('dashboard-chat-send'),
    starterPrompts: [
      'Help me write acceptance criteria for login.',
      'Review my feature spec and find missing edge cases.',
      'Create a test checklist for this sprint goal.',
    ],
    onConversationSaved: refreshConversationList,
    onConversationSelected: refreshConversationList,
  });

  function refreshConversationList() {
    if (!conversationList) return;
    const current = controller.getCurrentConversation();
    const conversations = controller.listConversations(searchInput?.value || '');
    renderConversationList(conversationList, conversations, current.id, (id) => {
      controller.loadConversation(id);
      refreshConversationList();
    });
  }

  searchInput?.addEventListener('input', refreshConversationList);
  newButton?.addEventListener('click', () => {
    controller.createNewConversation();
    refreshConversationList();
  });

  refreshConversationList();
}

export async function migrateGuestConversationsAfterAuth() {
  const auth = getAuthState();
  if (!auth.isLoggedIn) return;

  const guestOwner = `guest:${getGuestSessionId()}`;
  const userOwner = `user:${auth.userEmail}`;

  const conversations = loadConversations();
  let moved = [];

  const updated = conversations.map((conversation) => {
    if (conversation.ownerKey !== guestOwner) return conversation;
    const migrated = { ...conversation, ownerKey: userOwner, updatedAt: new Date().toISOString() };
    moved.push(migrated);
    return migrated;
  });

  saveConversations(updated);

  const activeByOwner = getActiveByOwner();
  if (activeByOwner[guestOwner]) {
    activeByOwner[userOwner] = activeByOwner[guestOwner];
  }
  writeJson(STORAGE_KEYS.activeByOwner, activeByOwner);

  if (moved.length === 0) return;

  const apiBase = getBackendBase();
  try {
    const response = await fetch(`${apiBase}/conversations/migrate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        guestSessionId: getGuestSessionId(),
        userId: auth.userEmail,
        conversations: moved,
      }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      const error = payload.error || `Migration failed (${response.status})`;
      console.warn('[Migration] Backend migration failed:', error, `(local migration of ${moved.length} conversations completed)`);
      // Local migration is authoritative - continue silently
    } else {
      console.log(`[Migration] Successfully migrated ${moved.length} conversations to authenticated account`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.warn('[Migration] Network error during backend migration:', message, `(local migration of ${moved.length} conversations completed)`);
    // Local migration is authoritative - continue silently
  }
}

export function getPostAuthRedirect(defaultPath = './dashboard.html') {
  const params = new URLSearchParams(window.location.search);
  const returnTo = params.get('returnTo');
  if (!returnTo) return defaultPath;

  try {
    const decoded = decodeURIComponent(returnTo);

    // Reject if the decoded value itself contains a returnTo (nested redirect)
    if (decoded.includes('returnTo=')) return defaultPath;

    // Reject if it references another auth page (would create a loop)
    if (/\/(login|signup)\.html/.test(decoded)) return defaultPath;

    // Only allow relative paths — never absolute URLs or protocol-relative
    if (decoded.startsWith('/') || decoded.startsWith('./')) {
      // Strip any query params that could re-trigger redirect logic
      const cleanPath = decoded.split('?')[0];
      return cleanPath || defaultPath;
    }

    return defaultPath;
  } catch {
    return defaultPath;
  }
}
