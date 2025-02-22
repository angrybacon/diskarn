import { pgTable, text, unique } from 'drizzle-orm/pg-core';

export const notificationTable = pgTable(
  'notifications',
  { id: text().notNull(), server: text().notNull() },
  ({ id, server }) => [unique().on(id, server)],
);
