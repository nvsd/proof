import path from 'path';
import { fileURLToPath } from 'url';
import { test as setup, expect } from './test';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const authFile = path.join(currentDir, '../tests/.auth/user.json');

setup('authenticate', async ({ page }) => {
  const testInfo = setup.info();

  const response = await page.request.post('/dev-auth/test-user', {
    data: {
      testId: testInfo.testId,
      testTitle: testInfo.title,
      testFile: testInfo.file,
    },
  });

  expect(response.ok(), await response.json()).toBeTruthy();

  // Verify authentication worked
  await page.goto('/dashboard');
  await expect(page.getByText('Welcome back')).toBeVisible();

  await page.context().storageState({ path: authFile });
});
