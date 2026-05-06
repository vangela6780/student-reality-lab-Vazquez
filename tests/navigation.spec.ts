import { expect, test } from '@playwright/test';

test.describe('Navigation', () => {
  test('top navigation links load expected pages and sections', async ({ page }) => {
    await page.goto('./');

    await page.getByRole('link', { name: 'Why Specs?' }).click();
    await expect(page).toHaveURL(/#why-specs$/);
    await expect(page.getByTestId('why-specs-section')).toBeInViewport();

    await page.getByTestId('nav-content-page').click();
    await expect(page).toHaveURL(/why-spec-driven\.html/);
    await expect(page.getByRole('heading', { name: 'Why Spec-Driven Development Works' })).toBeVisible();
  });

  test('content page back navigation returns to homepage story', async ({ page }) => {
    await page.goto('why-spec-driven.html?returnTo=.%2Findex.html%23hero');

    await page.getByRole('link', { name: '← Back To Story Slides' }).click();
    await expect(page).toHaveURL(/index\.html#hero|\/#hero|#hero$/);
    await expect(page.getByTestId('hero-section')).toBeVisible();
  });

  test('auth-related pages load and support returning home', async ({ page }) => {
    await page.goto('./');

    await page.getByRole('link', { name: 'Login' }).click();
    await expect(page).toHaveURL(/login\.html/);
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();

    await page.getByRole('link', { name: '← Back to Home' }).click();
    await expect(page).toHaveURL(/index\.html|\/$/);
    await expect(page.getByTestId('hero-section')).toBeVisible();

    await page.goto('signup.html');
    await expect(page.getByRole('heading', { name: 'Get Started' })).toBeVisible();
  });
});
