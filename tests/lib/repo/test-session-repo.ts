import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { BaseTestRepo } from './base-test-repo';
import { sessionsTable } from '@/lib/server/db/schema';
import { connection } from '@/lib/server/db/connection';
import { TestSession } from '../factory/test-session-factory';
import { selectSessionSchema, insertSessionSchema } from '@/lib/server/db/repo/sessions';
import type { Session, NewSession } from '@/lib/server/db/repo/sessions';

// Static validation schemas - created once
const userIdSchema = z.number().int().positive('User ID must be a positive integer');
const sessionIdSchema = z.string().min(1, 'Session ID is required');
const secretHashSchema = z.string().regex(/^[0-9a-fA-F]+$/, 'Secret hash must be valid hex string');

export class TestSessionRepo extends BaseTestRepo<typeof sessionsTable, Session, NewSession> {
  constructor() {
    super(connection, sessionsTable, selectSessionSchema, insertSessionSchema);
    this.useStringIds(); // Sessions use string IDs
  }

  async findByUserId(userId: number): Promise<Session[]> {
    const validatedUserId = userIdSchema.parse(userId);

    const result = await this.db.select().from(this.table).where(eq(sessionsTable.userId, validatedUserId));
    return await Promise.all(result.map((s: any) => this.selectSchema.parseAsync(s)));
  }

  async findBySessionId(sessionId: string): Promise<Session | null> {
    const validatedSessionId = sessionIdSchema.parse(sessionId);

    const result = await this.db.select().from(this.table).where(eq(sessionsTable.id, validatedSessionId)).limit(1);
    if (result.length > 0) {
      return await this.selectSchema.parseAsync(result[0]);
    }
    return null;
  }

  async deleteByUserId(userId: number): Promise<number> {
    const validatedUserId = userIdSchema.parse(userId);

    const userSessions = await this.findByUserId(validatedUserId);
    if (userSessions.length === 0) {
      return 0;
    }

    const result = await this.db.delete(this.table).where(eq(sessionsTable.userId, validatedUserId));
    return userSessions.length;
  }

  async deleteBySessionId(sessionId: string): Promise<boolean> {
    const validatedSessionId = sessionIdSchema.parse(sessionId);

    const session = await this.findBySessionId(validatedSessionId);
    if (!session) {
      return false;
    }

    await this.db.delete(this.table).where(eq(sessionsTable.id, validatedSessionId));
    return true;
  }

  async createSession(userId: number, sessionId: string, secretHash: string): Promise<Session> {
    const validatedData = {
      userId: userIdSchema.parse(userId),
      id: sessionIdSchema.parse(sessionId),
      secretHash: secretHashSchema.parse(secretHash),
      createdAt: new Date(),
    };

    return await this.create(validatedData as NewSession);
  }

  async createFromFactory(factory: TestSession): Promise<Session> {
    return await this.create(factory.toNewSession());
  }

  async createManyFromFactories(factories: TestSession[]): Promise<Session[]> {
    const results: Session[] = [];
    for (const factory of factories) {
      const session = await this.create(factory.toNewSession());
      results.push(session);
    }
    return results;
  }

  async createSessionForUser(userId: number): Promise<Session> {
    const factory = TestSession.forUser(userId);
    return await this.createFromFactory(factory);
  }
}
