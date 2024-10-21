import Fastify from 'fastify';
import { xml2js } from 'xml-js';
import { z } from 'zod';

import { Bot } from './bot';

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
  console.error(`[server] An error occurred "${error.message}"`);
  return Bot.error('An error occurred', error.message);
});

server.get('/challenge', {
  handler: ({ query }) => {
    const challenge = (query as { 'hub.challenge': string })['hub.challenge'];
    console.info(`[server] Verification challenge received "${challenge}"`);
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
    const { feed } = zNotification.parse(body);
    console.info(`[server] Received WebSub ${JSON.stringify(feed, null, 2)}`);
    const { entry, title, updated } = feed;
    Bot.log({
      body: [updated, title],
      fields: Object.entries(entry).map(([key, value]) => [
        `\`${key}\``,
        `\`${value}\``,
      ]),
      title: 'Received WebSub notification',
    });
    Bot.post(entry.title, entry.link);
  } catch (error) {
    const message = error instanceof Error ? error.message : `${error}`;
    console.error(`[server] Could not read WebSub notification`);
    console.error(message);
    console.error(JSON.stringify(body, null, 2));
    Bot.error('Could not read WebSub notification', message);
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
      server.log.info(`Server running on ${address}`);
    } catch (error) {
      server.log.error(error);
      process.exit(1);
    }
  },
  stop: () => server.close(),
} as const;
