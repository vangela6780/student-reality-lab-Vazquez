import { expect, test } from '@playwright/test';
import { CHAT_API_ENDPOINT, openChat, sendChatMessage } from './helpers/chat';

test.describe('Chatbot', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./');
    await openChat(page);
  });

  test('allows typing, sending, loading indicator, and rendering assistant response', async ({ page }) => {
    await page.route(CHAT_API_ENDPOINT, async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ reply: 'Specs help teams align.' }),
      });
    });

    await page.getByTestId('chat-input').fill('Why are specs useful?');
    await expect(page.getByTestId('chat-input')).toHaveValue('Why are specs useful?');

    await page.getByTestId('chat-send').click();
    await expect(page.getByTestId('chat-send')).toHaveText('...');

    const chatMessages = page.locator('[data-testid="chat-messages"] > div');
    await expect(chatMessages.filter({ hasText: 'Why are specs useful?' })).toBeVisible();
    await expect(chatMessages.filter({ hasText: 'Specs help teams align.' })).toBeVisible();
    await expect(page.getByTestId('chat-send')).toHaveText('Send');
  });

  test('shows graceful error when API fails', async ({ page }) => {
    await page.route(CHAT_API_ENDPOINT, async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'server failed' }),
      });
    });

    await sendChatMessage(page, 'Can you help with user stories?');

    const errorMsg = page
      .locator('[data-testid="chat-messages"] > div')
      .filter({ hasText: 'I could not reach the AI service.' });

    await expect(errorMsg).toBeVisible();
    await expect(page.getByTestId('chat-panel')).toBeVisible();
  });
});
