import { sqliteTable, text, unique } from 'drizzle-orm/sqlite-core';

export const notificationTable = sqliteTable(
  'notifications',
  { id: text().notNull(), server: text().notNull() },
  ({ id, server }) => ({ uniqueIdOnServer: unique().on(id, server) }),
);
