import { defineConfig } from 'drizzle-kit';

if (!process.env.DB_NAME) throw new Error('Missing database name');

export default defineConfig({
  dbCredentials: { url: process.env.DB_NAME },
  dialect: 'sqlite',
  out: './database',
  schema: './database/schema.ts',
});
