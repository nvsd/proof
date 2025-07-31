import z from 'zod';
import { eq } from 'drizzle-orm';
import { usersTable } from '@/lib/server/db/schema';
import { fail, Result, success } from '@/lib/result';
import { connection } from '@/lib/server/db/connection';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;

export const selectUserSchema = createSelectSchema(usersTable).extend({
  email: z.email(),
});

export const insertUserSchema = createInsertSchema(usersTable).extend({
  email: z.email(),
  name: z.string().min(1, 'Name is required'),
  googleId: z.string().min(1, 'Google ID is required'),
  picture: z.url('Picture must be a valid URL'),
});

export async function validateUser(data: unknown): Promise<Result<User>> {
  try {
    const userData = await selectUserSchema.parseAsync(data);
    return success(userData);
  } catch (error) {
    return fail(error);
  }
}

export async function validateNewUser(data: unknown): Promise<Result<NewUser>> {
  try {
    const userData = await insertUserSchema.parseAsync(data);
    return success(userData);
  } catch (error) {
    return fail(error);
  }
}

export async function createUser(data: unknown): Promise<Result<User>> {
  try {
    const validated = await validateNewUser(data);
    if (!validated.success) return validated;
    const result = await connection.insert(usersTable).values(validated.data).returning();

    return success(result[0]);
  } catch (error) {
    return fail(error);
  }
}

export async function getUser(id: number): Promise<Result<User>> {
  try {
    const result = await connection.select().from(usersTable).where(eq(usersTable.id, id));
    return success(result[0]);
  } catch (error) {
    return fail(error);
  }
}

export async function getUserByGoogleId(googleId: string): Promise<Result<User>> {
  try {
    const result = await connection.select().from(usersTable).where(eq(usersTable.googleId, googleId));
    return success(result[0]);
  } catch (error) {
    return fail(error);
  }
}
