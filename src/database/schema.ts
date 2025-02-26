import { pgTable, primaryKey, text } from 'drizzle-orm/pg-core';

export const notificationTable = pgTable(
  'notifications',
  { id: text().notNull(), server: text().notNull() },
  ({ id, server }) => [primaryKey({ columns: [id, server] })],
);
