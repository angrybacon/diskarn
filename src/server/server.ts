import { drizzle } from 'drizzle-orm/node-postgres';
import Fastify from 'fastify';
import { xml2js } from 'xml-js';

import { notificationTable } from '../../database/schema';
import { process as processChallenge } from '../karnnect/notification';
import { logger } from './logger';

if (!process.env.DATABASE_URL) throw new Error('Missing database connection');

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
  const rows = await database
    .insert(notificationTable)
    .values(notifications)
    .onConflictDoNothing()
    .returning();
  logger.log(rows);
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
    } catch (error) {
      logger.error(error);
      process.exit(1);
    }
  },
  stop: () => server.close(),
} as const;
