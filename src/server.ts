import Fastify from 'fastify';
import { xml2js } from 'xml-js';

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

server.get('/challenge', {
  handler: ({ query }) => {
    const challenge = (query as { 'hub.challenge': string })['hub.challenge'];
    console.log(`[server] Verification challenge received "${challenge}"`);
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

server.post('/challenge', ({ body }) => {
  console.log(`[server] Received WebSub "${JSON.stringify(body)}"`);
  Bot.write(
    '# Raw (stringified)',
    [`Typeof: ${typeof body}`, { pre: true }],
    [JSON.stringify(body, null, 2), { pre: true }],
  );
  Bot.write(
    '# Raw',
    [`Typeof: ${typeof body}`, { pre: true }],
    [body as string, { pre: true }],
  );
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
