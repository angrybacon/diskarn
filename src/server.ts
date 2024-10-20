import Fastify from 'fastify';
import { xml2json } from 'xml-js';

import { Bot } from './bot';

const server = Fastify({ logger: true });

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
  Bot.write('# Raw', [body as string, { pre: true }]);
  Bot.write('# JSON (default)', [xml2json(body as string), { pre: true }]);
  Bot.write('# JSON (compact)', [
    xml2json(body as string, { compact: true }),
    { pre: true },
  ]);
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
