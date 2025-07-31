import z from 'zod';
import { eq } from 'drizzle-orm';
import { connection } from '../connection';
import { fail, Result, success } from '@/lib/result';
import { sessionsTable } from '@/lib/server/db/schema';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export type Session = typeof sessionsTable.$inferSelect;
export type NewSession = typeof sessionsTable.$inferInsert;

export const selectSessionSchema = createSelectSchema(sessionsTable).extend({
  secretHash: z.string().regex(/^[0-9a-fA-F]+$/, 'Must be a valid hex string'),
});

export const insertSessionSchema = createInsertSchema(sessionsTable).extend({
  secretHash: z.string().regex(/^[0-9a-fA-F]+$/, 'Must be a valid hex string'),
  userId: z.number().positive('User ID must be positive'),
});

export async function validateSession(data: unknown): Promise<Result<Session>> {
  try {
    const sessionData = await selectSessionSchema.parseAsync(data);
    return success(sessionData);
  } catch (error) {
    return fail(error);
  }
}

export async function validateNewSession(data: unknown): Promise<Result<NewSession>> {
  try {
    const sessionData = await insertSessionSchema.parseAsync(data);
    return success(sessionData);
  } catch (error) {
    return fail(error);
  }
}

export async function createSession(data: unknown): Promise<Result<Session>> {
  try {
    const validated = await validateNewSession(data);
    if (!validated.success) return validated;
    const result = await connection.insert(sessionsTable).values(validated.data).returning();

    return success(result[0]);
  } catch (error) {
    return fail(error);
  }
}

export async function getSession(id: string): Promise<Result<Session>> {
  try {
    const result = await connection.select().from(sessionsTable).where(eq(sessionsTable.id, id));
    return success(result[0]);
  } catch (error) {
    return fail(error);
  }
}

export async function deleteSession(id: string): Promise<Result<void>> {
  try {
    await connection.delete(sessionsTable).where(eq(sessionsTable.id, id));
    return success(undefined);
  } catch (error) {
    return fail(error);
  }
}

export async function deleteUserSessions(userId: number): Promise<Result<void>> {
  try {
    await connection.delete(sessionsTable).where(eq(sessionsTable.userId, userId));
    return success(undefined);
  } catch (error) {
    return fail(error);
  }
}
