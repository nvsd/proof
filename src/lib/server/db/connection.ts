import { Resource } from 'sst';
import * as schema from '@/lib/server/db/schema';
import { drizzle } from 'drizzle-orm/postgres-js';

function createDatabaseUrl(): string {
  const db = Resource.AppDatabase;
  return `postgresql://${db.username}:${db.password}@${db.host}:${db.port}/${db.database}`;
}

export const connection = drizzle({
  connection: createDatabaseUrl(),
  schema,
});
