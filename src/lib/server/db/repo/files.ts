import z from 'zod';
import { connection } from '../connection';
import { and, eq, desc } from 'drizzle-orm';
import { filesTable } from '@/lib/server/db/schema';
import { fail, Result, success } from '@/lib/result';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export type File = typeof filesTable.$inferSelect;
export type NewFile = typeof filesTable.$inferInsert;

export const selectFileSchema = createSelectSchema(filesTable).extend({
  fileName: z.string().min(1, 'File name is required'),
  contentType: z.string().min(1, 'Content type is required'),
  size: z.number().positive('File size must be positive'),
});

export const insertFileSchema = createInsertSchema(filesTable).extend({
  fileName: z.string().min(1, 'File name is required'),
  contentType: z.string().min(1, 'Content type is required'),
  size: z.number().positive('File size must be positive'),
  userId: z.number().positive('User ID must be positive'),
});

export async function validateFile(data: unknown): Promise<Result<File>> {
  const fileData = await selectFileSchema.parseAsync(data);
  try {
    return success(fileData);
  } catch (error) {
    return fail(error);
  }
}

export async function validateNewFile(data: unknown): Promise<Result<NewFile>> {
  try {
    const fileData = await insertFileSchema.parseAsync(data);
    return success(fileData);
  } catch (error) {
    return fail(error);
  }
}

export async function createFile(data: unknown): Promise<Result<File>> {
  try {
    const validated = await validateNewFile(data);
    if (!validated.success) return validated;
    const result = await connection.insert(filesTable).values(validated.data).returning();

    return success(result[0]);
  } catch (error) {
    return fail(error);
  }
}

export async function getFile(id: number, userId: number): Promise<Result<File>> {
  try {
    const result = await connection
      .select()
      .from(filesTable)
      .where(and(eq(filesTable.id, id), eq(filesTable.userId, userId)));
    return success(result[0]);
  } catch (error) {
    return fail(error);
  }
}

export async function getFiles(userId: number): Promise<Result<File[]>> {
  try {
    const result = await connection
      .select()
      .from(filesTable)
      .where(eq(filesTable.userId, userId))
      .orderBy(desc(filesTable.createdAt));
    if (result.length === 0) return success([]);

    return success(result);
  } catch (error) {
    return fail(error);
  }
}
