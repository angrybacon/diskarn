import { pgTable, primaryKey, text } from 'drizzle-orm/pg-core';

export const notificationsTable = pgTable(
  'notifications',
  { id: text().notNull(), server: text().notNull() },
  ({ id, server }) => [primaryKey({ columns: [id, server] })],
);
