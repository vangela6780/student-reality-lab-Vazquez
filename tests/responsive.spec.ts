import { expect, test } from '@playwright/test';

test.describe('Responsive behavior', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('homepage remains usable on mobile viewport', async ({ page }) => {
    await page.goto('./');

    await expect(page.getByTestId('hero-section')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Building Software Right' })).toBeVisible();

    await page.getByTestId('chat-toggle').click();
    await expect(page.getByTestId('chat-panel')).toBeVisible();
    await expect(page.getByTestId('chat-input')).toBeVisible();
  });

  test('navigation remains accessible on mobile', async ({ page }) => {
    await page.goto('./');

    await expect(page.getByTestId('main-nav')).toBeVisible();
    await expect(page.getByTestId('nav-links')).toBeVisible();

    await page.getByRole('link', { name: 'Benefits' }).click();
    await expect(page).toHaveURL(/#benefits$/);
    await expect(page.getByTestId('benefits-section')).toBeInViewport();
  });
});
