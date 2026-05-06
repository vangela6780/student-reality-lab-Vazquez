import { expect, test } from '@playwright/test';

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./');
  });

  test('loads successfully and renders hero content', async ({ page }) => {
    await expect(page).toHaveTitle(/DevLearn/);
    await expect(page.getByTestId('hero-section')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Building Software Right' })).toBeVisible();
    await expect(page.getByText('A journey through spec-driven development.')).toBeVisible();
  });

  test('reveals scrollytelling sections during scroll', async ({ page }) => {
    const benefitsSection = page.getByTestId('benefits-section');
    await benefitsSection.scrollIntoViewIfNeeded();
    await expect(benefitsSection).toHaveClass(/is-visible/);
    await expect(page.getByRole('heading', { name: 'Why Specs Matter' })).toBeVisible();
  });

  test('shows important educational content text', async ({ page }) => {
    await expect(page.getByText('The 90% Problem')).toBeVisible();
    await expect(page.getByText('Result: 40-60% faster development. Zero surprises.')).toBeVisible();
    await expect(page.getByText('Ready to Build Right?')).toBeVisible();
  });
});
