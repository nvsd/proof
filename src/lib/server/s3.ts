import { Resource } from 'sst';
import { fail, Result, success } from '@/lib/result';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl as awsGetSignedUrl } from '@aws-sdk/s3-request-presigner';

const twentyMB = 20_000_000;
const s3Client = new S3Client();

export async function getSignedUrl(bucket: string, key?: string): Promise<Result<string>> {
  const command = new PutObjectCommand({
    Key: key ? key : crypto.randomUUID(),
    Bucket: bucket,
  });

  try {
    return success(await awsGetSignedUrl(s3Client, command));
  } catch (error) {
    return fail(error);
  }
}

export async function uploadFile(file: File, fileName: string): Promise<Result<Response>> {
  if (!file.type) throw new Error('File has no type');
  if (file.size === 0) throw new Error('File is empty');
  if (file.size > twentyMB) throw new Error('File is too large. Max 20MB');

  // @ts-expect-error TODO: Create a new bucket for files
  const result = await getSignedUrl(Resource.DocumentIngestionBucket.name, fileName);
  if (!result.success) return result;

  const response = await fetch(result.data, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  });

  if (!response.ok) return fail(await response.text());

  return success(response);
}
