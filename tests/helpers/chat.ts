import { expect, type Page } from '@playwright/test';

export const CHAT_API_ENDPOINT = '**/api/simple-chat';

export async function openChat(page: Page): Promise<void> {
  const panel = page.getByTestId('chat-panel');

  if (await panel.isVisible()) {
    return;
  }

  await page.getByTestId('chat-toggle').click();
  await expect(panel).toBeVisible();
}

export async function sendChatMessage(page: Page, message: string): Promise<void> {
  await page.getByTestId('chat-input').fill(message);
  await page.getByTestId('chat-send').click();
}

export function userMessages(page: Page) {
  return page.locator('[data-testid="chat-messages"] > div').filter({ hasText: /.+/ });
}

export function assistantErrorMessage(page: Page) {
  return page.locator('[data-testid="chat-messages"] > div').filter({ hasText: 'I could not reach the AI service.' });
}
