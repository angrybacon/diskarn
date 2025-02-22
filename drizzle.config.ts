import { defineConfig } from 'drizzle-kit';

if (!process.env.DATABASE_URL) throw new Error('Missing database name');

export default defineConfig({
  dbCredentials: { url: process.env.DATABASE_URL },
  dialect: 'postgresql',
  schema: './database/schema.ts',
});
