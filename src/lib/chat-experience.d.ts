export function initHomeChatWidget(): void;
export function initDashboardAssistant(): void;
export function migrateGuestChatsToAuth(): Promise<void>;
export function getReturnUrl(fallback?: string): string;
