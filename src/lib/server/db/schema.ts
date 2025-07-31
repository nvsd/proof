import { relations } from 'drizzle-orm';
import { pgTable, text, integer, varchar, timestamp, serial } from 'drizzle-orm/pg-core';

export const sessionsTable = pgTable('session', {
  id: text('id').primaryKey(),
  userId: integer('user_id').notNull(),
  secretHash: varchar('secret_hash', { length: 255 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const sessionsRelations = relations(sessionsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [sessionsTable.userId],
    references: [usersTable.id],
  }),
}));

export const usersTable = pgTable('user', {
  id: serial('id').primaryKey(),
  googleId: text('google_id').notNull().unique(),
  email: text('email').notNull(),
  name: text('name').notNull(),
  picture: text('picture').notNull(),
});

export const usersRelations = relations(usersTable, ({ many }) => ({
  sessions: many(sessionsTable),
  files: many(filesTable),
}));

export const filesTable = pgTable('file', {
  id: serial('id').primaryKey(),
  fileName: text('file_name').notNull(),
  contentType: text('content_type').notNull(),
  size: integer('size').notNull(),
  userId: integer('user_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const filesRelations = relations(filesTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [filesTable.userId],
    references: [usersTable.id],
  }),
}));
