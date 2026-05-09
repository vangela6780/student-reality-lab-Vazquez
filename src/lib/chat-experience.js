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

function createAuthLinks() {
  const returnTo = encodeURIComponent(window.location.pathname + window.location.search + window.location.hash);
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
    await fetch(`${apiBase}/conversations/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, conversation }),
    });
  } catch {
    // Keep local data as fallback when network sync fails.
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
      window.location.href = createAuthLinks().signup;
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
        throw new Error(payload.error || `Server error (${response.status})`);
      }

      const reply = String(payload.reply || 'No response from AI.');
      conversation.messages.push(createMessage('assistant', reply));
      saveConversation();
      await syncConversationToBackend(apiBase, conversation.ownerKey, conversation);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown chat error';
      conversation.messages.push(createMessage('assistant', `Error: ${message}`));
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
  const chatPanel = document.getElementById('chat-panel');
  const chatToggle = document.getElementById('chat-toggle');
  const chatClose = document.getElementById('chat-close');

  const controller = createChatController({
    guestLimit: DEFAULT_GUEST_LIMIT,
    redirectOnGuestLimit: true,
    chatShell: chatPanel,
    modalHost: document.body,
    messagesWrap: document.getElementById('chat-messages'),
    usageLabel: document.getElementById('chat-usage-label'),
    input: document.getElementById('chat-input'),
    sendButton: document.getElementById('chat-send'),
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
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `assistant-thread ${conversation.id === activeId ? 'active' : ''}`;
    button.innerHTML = `
      <strong>${escapeHtml(conversation.title || 'New Conversation')}</strong>
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
    await fetch(`${apiBase}/conversations/migrate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        guestSessionId: getGuestSessionId(),
        userId: auth.userEmail,
        conversations: moved,
      }),
    });
  } catch {
    // local migration is authoritative when backend sync fails.
  }
}

export function getPostAuthRedirect(defaultPath = './dashboard.html') {
  const params = new URLSearchParams(window.location.search);
  const returnTo = params.get('returnTo');
  if (!returnTo) return defaultPath;

  try {
    const decoded = decodeURIComponent(returnTo);
    if (decoded.startsWith('/') || decoded.startsWith('./')) {
      return decoded;
    }
    return defaultPath;
  } catch {
    return defaultPath;
  }
}
