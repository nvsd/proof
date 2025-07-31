import { Result } from '@/lib/result';
import { File as DBFile } from '@/lib/server/db/repo/files';
import { uploadFile } from './s3';
import { createFile as createFileDB, getFile as getFileDB } from '@/lib/server/db/repo/files';
import { getFiles as getFilesDB } from '@/lib/server/db/repo/files';

export async function createFile(file: File, userId: number): Promise<Result<DBFile>> {
  const fileName = file.name.split('.').slice(0, -1).join('.');
  const s3Key = `${userId}/${crypto.randomUUID()}-${fileName}`;
  const response = await uploadFile(file, s3Key);
  if (!response.success) return response;

  // TODO: Add some type of file location pointer to the database
  return createFileDB({
    fileName,
    contentType: file.type,
    size: file.size,
    userId,
  });
}

export async function getFile(id: number, userId: number): Promise<Result<DBFile>> {
  const result = await getFileDB(id, userId);
  // TODO: Add url to the response if not in the database after doing the above todo

  return result;
}

export async function getFiles(userId: number): Promise<Result<DBFile[]>> {
  const result = await getFilesDB(userId);
  // TODO: Add url to the response if not in the database after doing the above todo

  return result;
}
