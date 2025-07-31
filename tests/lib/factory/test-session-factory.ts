import { createHash } from 'crypto';
import { faker } from '@faker-js/faker';
import { NewSession } from '@/lib/server/db/repo/sessions';

export class TestSession {
  public readonly sessionId: string;
  public readonly userId: number;
  public readonly secretHash: string;
  public readonly createdAt: Date;

  constructor(userId: number, sessionId?: string) {
    this.userId = userId;
    this.sessionId = sessionId || this.generateSessionId();
    this.secretHash = this.generateSecretHash();
    this.createdAt = new Date();
  }

  private generateSessionId(): string {
    return createHash('sha256')
      .update(`${this.userId}-${Date.now()}-${faker.string.alphanumeric(16)}`)
      .digest('hex');
  }

  private generateSecretHash(): string {
    return createHash('sha256')
      .update(`${this.sessionId}-secret-${faker.string.alphanumeric(32)}`)
      .digest('hex');
  }

  toNewSession(): NewSession {
    return {
      id: this.sessionId,
      userId: this.userId,
      secretHash: this.secretHash,
      createdAt: this.createdAt,
    };
  }

  static forUser(userId: number): TestSession {
    return new TestSession(userId);
  }

  static withId(userId: number, sessionId: string): TestSession {
    return new TestSession(userId, sessionId);
  }
}
