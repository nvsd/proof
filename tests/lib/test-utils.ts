import { TestUserRepo } from './repo/test-user-repo';
import { TestUser } from './factory/test-user-factory';
import { Page, APIRequestContext, APIResponse, expect } from '@playwright/test';

export class TestUtils {
  private userRepo = new TestUserRepo();

  async createAndAuthenticateUser(page: Page, testUser: TestUser): Promise<void> {
    // Create the user via our dev endpoint
    const response = await page.request.post(`/dev-auth/test-user`, {
      data: {
        testId: testUser.testId,
        email: testUser.email,
        name: testUser.name,
        googleId: testUser.googleId,
        picture: testUser.picture,
      },
    });

    expect(response.ok()).toBeTruthy();

    // Verify authentication worked
    await page.goto(`/dashboard`);
    await expect(page.getByText('Welcome back')).toBeVisible();
  }

  async createUserViaApi(apiContext: APIRequestContext, testUser: TestUser): Promise<APIResponse> {
    const response = await apiContext.post(`/dev-auth/test-user`, {
      data: {
        testId: testUser.testId,
        email: testUser.email,
        name: testUser.name,
        googleId: testUser.googleId,
        picture: testUser.picture,
      },
    });

    if (!response.ok()) {
      throw new Error(`Failed to create user via dev-auth: ${response.status()} ${response.statusText()}`);
    }

    return response;
  }

  async createUserInDatabase(testUser: TestUser) {
    return await this.userRepo.createFromFactory(testUser);
  }

  async createOrFind(testUser: TestUser) {
    return await this.userRepo.createOrFind(testUser);
  }

  async findUserByEmail(email: string) {
    return await this.userRepo.findByEmail(email);
  }

  async cleanupUser(email: string) {
    return await this.userRepo.deleteByEmail(email);
  }

  async cleanupUsers(emails: string[]) {
    return await this.userRepo.deleteManyByEmails(emails);
  }
}
