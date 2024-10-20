import Fastify from 'fastify';
import { xml2js } from 'xml-js';
import { z } from 'zod';

import { Bot } from '../bot';
import { Logger } from '../logger';

const logger = Logger('SERVER');

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

server.addHook('onError', (_request, _reply, error) => {
  logger.error(`An error occurred "${error.message}"`);
  return Bot.log.error('An error occurred', error.message);
});

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

const zText = z.object({ _text: z.string() }).transform((it) => it._text);

const zNotification = z.object({
  feed: z.object({
    entry: z
      .object({
        author: z.object({ name: zText }).transform((it) => it.name),
        id: zText,
        link: z
          .object({ _attributes: z.object({ href: z.string() }) })
          .transform((it) => it._attributes.href),
        published: zText,
        title: zText,
        updated: zText,
        'yt:channelId': zText,
        'yt:videoId': zText,
      })
      .transform(
        ({ 'yt:channelId': channelId, 'yt:videoId': videoId, ...it }) => ({
          ...it,
          channelId,
          videoId,
        }),
      ),
    title: zText,
    updated: zText,
  }),
});

server.post('/challenge', ({ body }) => {
  try {
    logger.log('New notification (raw)', body);
    const { feed } = zNotification.parse(body);
    logger.log('New notification (parsed)', feed);
    const { entry, title, updated } = feed;
    Bot.log.success(
      'New notification',
      [updated, title],
      Object.entries(entry),
    );
    Bot.post(entry.title, entry.link);
  } catch (error) {
    const message = error instanceof Error ? error.message : `${error}`;
    logger.error('Could not read notification', message, body);
    Bot.log.error('Could not read notification', message);
  }
  return {};
});

server.get('/hello', () => 'Which Karn?');

export const Server = {
  start: async () => {
    try {
      if (!process.env.HOST) throw new Error('Could not find host to use');
      if (!process.env.PORT) throw new Error('Could not find port to use');
      const address = await server.listen({
        host: process.env.HOST,
        port: parseInt(process.env.PORT),
      });
      logger.log(`Server running on ${address}`);
    } catch (error) {
      logger.error(`${error}`);
      process.exit(1);
    }
  },
  stop: () => server.close(),
} as const;
