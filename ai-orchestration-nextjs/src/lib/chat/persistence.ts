import { z } from 'zod';

export type StoredMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
};

export type StoredConversation = {
  id: string;
  ownerKey: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: StoredMessage[];
};

type RateWindow = {
  startMs: number;
  count: number;
};

type ChatStore = {
  conversations: Map<string, StoredConversation>;
  byUser: Map<string, Set<string>>;
  rateLimitByIp: Map<string, RateWindow>;
};

const conversationSchema = z.object({
  id: z.string().min(1).max(120),
  ownerKey: z.string().min(1).max(200),
  title: z.string().max(200).default('New Conversation'),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
  messages: z.array(
    z.object({
      id: z.string().min(1).max(120),
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string().min(1).max(12000),
      createdAt: z.string().min(1),
    })
  ).max(500),
});

const emptyStore = (): ChatStore => ({
  conversations: new Map<string, StoredConversation>(),
  byUser: new Map<string, Set<string>>(),
  rateLimitByIp: new Map<string, RateWindow>(),
});

const chatStore = (globalThis as { __devlearnChatStore?: ChatStore }).__devlearnChatStore ?? emptyStore();
(globalThis as { __devlearnChatStore?: ChatStore }).__devlearnChatStore = chatStore;

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  return 'unknown';
}

export function assertRateLimit(ip: string, maxRequests: number, windowMs: number): void {
  const now = Date.now();
  const current = chatStore.rateLimitByIp.get(ip);

  if (!current || now - current.startMs > windowMs) {
    chatStore.rateLimitByIp.set(ip, { startMs: now, count: 1 });
    return;
  }

  if (current.count >= maxRequests) {
    throw new Error('RATE_LIMITED');
  }

  current.count += 1;
  chatStore.rateLimitByIp.set(ip, current);
}

export function sanitizeUserId(userId: string): string {
  const normalized = userId.trim().toLowerCase();
  if (!normalized || normalized.length > 160) {
    throw new Error('INVALID_USER');
  }
  return normalized;
}

function getUserKey(userId: string): string {
  return `user:${userId}`;
}

function dedupeMessages(messages: StoredMessage[]): StoredMessage[] {
  const seen = new Set<string>();
  const deduped: StoredMessage[] = [];

  for (const message of messages) {
    if (seen.has(message.id)) continue;
    seen.add(message.id);
    deduped.push(message);
  }

  return deduped;
}

function normalizeConversation(userId: string, conversation: StoredConversation): StoredConversation {
  const parsed = conversationSchema.parse(conversation);
  const ownerKey = getUserKey(userId);

  if (parsed.ownerKey !== ownerKey) {
    return { ...parsed, ownerKey };
  }

  return parsed;
}

export function upsertConversation(userId: string, conversation: StoredConversation): StoredConversation {
  const normalized = normalizeConversation(userId, conversation);
  const existing = chatStore.conversations.get(normalized.id);

  const merged: StoredConversation = existing
    ? {
        ...normalized,
        createdAt: existing.createdAt,
        messages: dedupeMessages([...existing.messages, ...normalized.messages]),
      }
    : {
        ...normalized,
        messages: dedupeMessages(normalized.messages),
      };

  chatStore.conversations.set(merged.id, merged);

  const byUserSet = chatStore.byUser.get(userId) ?? new Set<string>();
  byUserSet.add(merged.id);
  chatStore.byUser.set(userId, byUserSet);

  return merged;
}

export function listConversations(userId: string): StoredConversation[] {
  const ids = chatStore.byUser.get(userId);
  if (!ids) return [];

  const items: StoredConversation[] = [];
  for (const id of ids) {
    const item = chatStore.conversations.get(id);
    if (!item) continue;
    if (item.ownerKey !== getUserKey(userId)) continue;
    items.push(item);
  }

  return items.sort((a, b) => {
    const aMs = new Date(a.updatedAt).getTime();
    const bMs = new Date(b.updatedAt).getTime();
    return bMs - aMs;
  });
}

export function getConversation(userId: string, conversationId: string): StoredConversation | null {
  const conversation = chatStore.conversations.get(conversationId);
  if (!conversation) return null;
  if (conversation.ownerKey !== getUserKey(userId)) return null;
  return conversation;
}

export function migrateGuestConversations(
  userId: string,
  guestSessionId: string,
  conversations: StoredConversation[]
): StoredConversation[] {
  const safeGuest = guestSessionId.trim();
  if (!safeGuest) {
    throw new Error('INVALID_GUEST_SESSION');
  }

  const guestOwner = `guest:${safeGuest}`;
  const userOwner = getUserKey(userId);

  const migrated: StoredConversation[] = [];

  for (const conversation of conversations) {
    if (conversation.ownerKey !== guestOwner) continue;
    const prepared = {
      ...conversation,
      ownerKey: userOwner,
      updatedAt: new Date().toISOString(),
    };
    migrated.push(upsertConversation(userId, prepared));
  }

  return migrated;
}
