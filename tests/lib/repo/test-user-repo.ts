import { z } from 'zod';
import { eq, inArray } from 'drizzle-orm';
import { BaseTestRepo } from './base-test-repo';
import { TestUser } from '../factory/test-user-factory';
import { connection } from '@/lib/server/db/connection';
import { usersTable, sessionsTable } from '@/lib/server/db/schema';
import { selectUserSchema, insertUserSchema } from '@/lib/server/db/repo/users';

import type { User, NewUser } from '@/lib/server/db/repo/users';

// Static validation schemas - created once
const emailSchema = z.email('Invalid email format');
const googleIdSchema = z.string().min(1, 'Google ID is required');
const emailsSchema = z.array(emailSchema).min(1, 'At least one email is required');

export class TestUserRepo extends BaseTestRepo<typeof usersTable, User, NewUser> {
  constructor() {
    super(connection, usersTable, selectUserSchema, insertUserSchema);
    this.useNumberIds(); // Users have serial IDs
  }

  async findByEmail(email: string): Promise<User | null> {
    const validatedEmail = emailSchema.parse(email);

    const result = await this.db.select().from(this.table).where(eq(usersTable.email, validatedEmail)).limit(1);
    if (result.length > 0) {
      return await this.selectSchema.parseAsync(result[0]);
    }
    return null;
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    const validatedGoogleId = googleIdSchema.parse(googleId);

    const result = await this.db.select().from(this.table).where(eq(usersTable.googleId, validatedGoogleId)).limit(1);
    if (result.length > 0) {
      return await this.selectSchema.parseAsync(result[0]);
    }
    return null;
  }

  async deleteByEmail(email: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    if (!user) {
      return false;
    }
    return await this.delete(user.id);
  }

  async deleteManyByEmails(emails: string[]): Promise<number> {
    const validatedEmails = emailsSchema.parse(emails);

    const foundUsers = await this.db.select().from(this.table).where(inArray(usersTable.email, validatedEmails));
    const validatedUsers = await Promise.all(foundUsers.map((u: any) => this.selectSchema.parseAsync(u)));

    const userIds = validatedUsers.map((u) => u.id);
    return await this.deleteMany(userIds);
  }

  async createOrFind(testUser: TestUser): Promise<User> {
    let user = await this.findByEmail(testUser.email);

    if (!user) {
      const userData = testUser.toNewUser();
      user = await this.create(userData);
    }

    return user;
  }

  async createFromFactory(factory: TestUser): Promise<User> {
    return await this.create(factory.toNewUser());
  }

  async createManyFromFactories(factories: TestUser[]): Promise<User[]> {
    const results: User[] = [];
    for (const factory of factories) {
      const user = await this.create(factory.toNewUser());
      results.push(user);
    }
    return results;
  }

  protected async beforeDelete(user: User): Promise<void> {
    await this.db.delete(sessionsTable).where(eq(sessionsTable.userId, user.id));
  }

  protected async beforeDeleteMany(users: User[]): Promise<void> {
    const userIds = users.map((u) => u.id);
    await this.db.delete(sessionsTable).where(inArray(sessionsTable.userId, userIds));
  }
}
