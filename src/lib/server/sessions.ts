import { eq } from 'drizzle-orm';
import { sha256 } from '@oslojs/crypto/sha2';
import { connection } from './db/connection';
import { User as DBUser } from './db/repo/users';
import { Result, success, fail } from '@/lib/result';
import { sessionsTable, usersTable } from './db/schema';
import { Session as DBSession } from './db/repo/sessions';
import { getCookie, setCookie } from '@/lib/server/cookie';
import { encodeBase32, encodeHexLowerCase } from '@oslojs/encoding';
import { createSession as createSessionDB } from './db/repo/sessions';
import { deleteSession, deleteUserSessions } from './db/repo/sessions';

export async function validateSessionToken(token: string): Promise<Result<SessionResult>> {
  try {
    const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

    const result = await connection
      .select({
        session: sessionsTable,
        user: usersTable,
      })
      .from(sessionsTable)
      .innerJoin(usersTable, eq(sessionsTable.userId, usersTable.id))
      .where(eq(sessionsTable.id, sessionId))
      .limit(1);

    if (result.length === 0) return success({ session: null, user: null });

    const row = result[0];
    const session = row.session;
    const user = row.user;

    const sessionAge = Date.now() - session.createdAt.getTime();
    const thirtyDaysMs = 1000 * 60 * 60 * 24 * 30;

    if (sessionAge >= thirtyDaysMs) {
      const deleteResult = await deleteSession(session.id);
      if (!deleteResult.success) {
        return fail('Failed to delete expired session');
      }
      return success({ session: null, user: null });
    }

    return success({ session, user });
  } catch (error) {
    return fail(error);
  }
}

export async function getCurrentSession(): Promise<Result<SessionResult>> {
  const token = getCookie('session') ?? null;
  if (token === null) {
    return success({ session: null, user: null });
  }
  return await validateSessionToken(token);
}

export async function invalidateSession(sessionId: string): Promise<Result<void>> {
  try {
    const result = await deleteSession(sessionId);
    if (!result.success) {
      return fail('Failed to delete session');
    }
    return success(undefined);
  } catch (error) {
    return fail(error);
  }
}

export async function invalidateUserSessions(userId: number): Promise<Result<void>> {
  try {
    const result = await deleteUserSessions(userId);
    if (!result.success) {
      return fail('Failed to delete user sessions');
    }
    return success(undefined);
  } catch (error) {
    return fail(error);
  }
}

export function setSessionTokenCookie(token: string, expiresAt: Date): Result<void> {
  try {
    setCookie('session', token, { expires: expiresAt });
    return success(undefined);
  } catch (error) {
    return fail(error);
  }
}

export function deleteSessionTokenCookie(): Result<void> {
  try {
    setCookie('session', '', { maxAge: 0 });
    return success(undefined);
  } catch (error) {
    return fail(error);
  }
}

export function generateSessionToken(): Result<string> {
  try {
    const tokenBytes = new Uint8Array(20);
    crypto.getRandomValues(tokenBytes);
    const token = encodeBase32(tokenBytes).toLowerCase();
    return success(token);
  } catch (error) {
    return fail(error);
  }
}

export async function createSession(token: string, userId: number): Promise<Result<DBSession>> {
  try {
    const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
    const secretHash = encodeHexLowerCase(sha256(new TextEncoder().encode(token + 'secret')));

    const newSessionData = {
      id: sessionId,
      userId,
      secretHash,
      createdAt: new Date(),
    };

    const result = await createSessionDB(newSessionData);
    if (!result.success) return fail('Failed to create session');
    return success(result.data);
  } catch (error) {
    return fail(error);
  }
}

export type SessionResult = { session: DBSession; user: DBUser } | { session: null; user: null };
