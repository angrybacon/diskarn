import Fastify from 'fastify';
import { xml2json } from 'xml-js';

import { Bot } from './bot';

const PORT = 3333;
const PATH = '/challenge';

const server = Fastify({ logger: true });

server.get(PATH, {
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

server.post(PATH, ({ body }) => {
  console.log(`[server] Received WebSub "${JSON.stringify(body)}"`);
  Bot.write(`Raw
\`\`\`
${body}
\`\`\``);
  Bot.write(`Raw (stringified)
\`\`\`
${JSON.stringify(body, null, 2)}
\`\`\``);
  Bot.write(`JSON (default)
\`\`\`
${xml2json(body as string)}
\`\`\``);
  Bot.write(`JSON (compact)
\`\`\`
${xml2json(body as string, { compact: true })}
\`\`\``);
  return {};
});

export const Server = {
  start: async () => {
    try {
      const address = await server.listen({ port: PORT });
      server.log.info(`Server running on ${address}`);
    } catch (error) {
      server.log.error(error);
      process.exit(1);
    }
  },
  stop: () => server.close(),
} as const;
