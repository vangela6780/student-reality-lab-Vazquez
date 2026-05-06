import { expect, test } from '@playwright/test';
import { CHAT_API_ENDPOINT, openChat, sendChatMessage } from './helpers/chat';

test.describe('Validation and resilient states', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./');
    await openChat(page);
  });

  test('does not submit empty chat input', async ({ page }) => {
    let apiCalled = false;
    await page.route(CHAT_API_ENDPOINT, async (route) => {
      apiCalled = true;
      await route.continue();
    });

    const messages = page.locator('[data-testid="chat-messages"] > div');
    const beforeCount = await messages.count();

    await page.getByTestId('chat-input').fill('   ');
    await page.getByTestId('chat-send').click();

    await expect(messages).toHaveCount(beforeCount);
    expect(apiCalled).toBeFalsy();
  });

  test('handles missing API reply safely', async ({ page }) => {
    await page.route(CHAT_API_ENDPOINT, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({}),
      });
    });

    await sendChatMessage(page, 'Say hello');

    const fallbackReply = page
      .locator('[data-testid="chat-messages"] > div')
      .filter({ hasText: 'No response from AI.' });

    await expect(fallbackReply).toBeVisible();
    await expect(page.getByTestId('chat-send')).toHaveText('Send');
  });

  test('invalid API states do not crash the UI', async ({ page }) => {
    await page.route(CHAT_API_ENDPOINT, async (route) => {
      await route.abort('failed');
    });

    await sendChatMessage(page, 'Test stability');
    await expect(page.getByTestId('chat-panel')).toBeVisible();
    await expect(page.getByTestId('chat-send')).toBeEnabled();

    await page.getByTestId('chat-close').click();
    await expect(page.getByTestId('chat-panel')).toBeHidden();

    await page.getByTestId('chat-toggle').click();
    await expect(page.getByTestId('chat-panel')).toBeVisible();
  });
});
