import { TestUtils } from './lib/test-utils';
import { test as base } from '@playwright/test';
import { TestUser } from './lib/factory/test-user-factory';

export const test = base.extend<
  {
    user: TestUser;
    testUtils: TestUtils;
  },
  {}
>({
  testUtils: async ({}, use) => {
    await use(new TestUtils());
  },

  user: [
    async ({ page, testUtils }, use, testInfo) => {
      // Create a test user from the test info
      const testUser = new TestUser({
        testId: testInfo.project.name,
        title: testInfo.title,
        file: testInfo.file,
      });

      // Create and authenticate the user using our test utils
      await testUtils.createAndAuthenticateUser(page, testUser);

      // Use the test user in the test
      await use(testUser);
    },
    { scope: 'test' },
  ],

  page: [
    async ({ browser, user }) => {
      const page = await browser.newPage();
      await page.goto('/');
      return page;
    },
    { scope: 'test' },
  ],
});

export { expect } from '@playwright/test';
