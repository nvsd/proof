import { test, expect } from './test';

test('user is logged in and has name displayed', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page.getByText('Welcome back')).toBeVisible();
});
