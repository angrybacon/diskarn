import { drizzle } from 'drizzle-orm/node-postgres';
import Fastify from 'fastify';
import { xml2js } from 'xml-js';

import { Bot } from '../bot/bot';
import { notificationTable } from '../database/schema';
import { process as processChallenge } from '../karnnect/notification';
import { logger } from './logger';

if (!process.env.DATABASE_URL) throw new Error('Missing database URL');

const database = drizzle({
  casing: 'snake_case',
  connection: process.env.DATABASE_URL,
});

logger.log('Connected to PostgreSQL database');

const server = Fastify();

server.addContentTypeParser(
  'application/atom+xml',
  { parseAs: 'buffer' },
  (_request, body, done) => {
    try {
      const data = xml2js(body.toString(), { compact: true });
      done(null, data);
    } catch (error) {
      done(error instanceof Error ? error : new Error(`${error}`));
    }
  },
);

server.addHook('onError', (_request, _reply, error) =>
  logger.error(`An error occurred "${error.message}"`),
);

server.get('/challenge', {
  handler: ({ query }) => {
    const challenge = (query as { 'hub.challenge': string })['hub.challenge'];
    logger.log(`Verification challenge received "${challenge}"`);
    return challenge;
  },
  schema: {
    querystring: {
      properties: { 'hub.challenge': { type: 'string' } },
      required: ['hub.challenge'],
      type: 'object',
    },
  },
});

server.post('/challenge', async ({ body }) => {
  const notifications = processChallenge(body);
  if (notifications.length) {
    const rows = await database
      .insert(notificationTable)
      .values(notifications.map(({ id, server }) => ({ id, server })))
      .onConflictDoNothing()
      .returning();
    logger.log(`Inserted ${rows.length} rows`, rows);
    const ids = rows.map((row) => row.id);
    notifications
      .filter(({ id }) => ids.includes(id))
      .forEach(({ notification, server }) => {
        Bot.post(server, notification.title, notification.link);
      });
  }
  return {};
});

server.get('/hello', () => {
  const message = 'Which Karn?';
  logger.log(message);
  return message;
});

export const Server = {
  start: async () => {
    try {
      if (!process.env.HOST) throw new Error('Missing host');
      if (!process.env.PORT) throw new Error('Missing port');
      const address = await server.listen({
        host: process.env.HOST,
        port: parseInt(process.env.PORT),
      });
      logger.log(`Server running on ${address}`);
      const rows = await database.select().from(notificationTable);
      logger.log(`Found ${rows.length} existing rows in database`);
      logger.log(rows);
    } catch (error) {
      logger.error(error);
      process.exit(1);
    }
  },
  stop: () => server.close(),
} as const;
