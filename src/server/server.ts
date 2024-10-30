import Fastify from 'fastify';
import { xml2js } from 'xml-js';

import { Bot } from '../bot/bot';
import { Logger } from '../logger';
import { zNotification, type Notification } from './models';

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

const history = new Set<string>();

const validate = ({ videoId }: Notification) => {
  if (history.has(videoId)) {
    return { skip: true, reason: 'duplicate' } as const;
  }
  // TODO Add instance-specific title filters
  return { skip: false } as const;
};

server.post('/challenge', ({ body }) => {
  try {
    const entry = zNotification.parse(body);
    const { channelId, link, title, videoId, ...rest } = entry;
    const { reason, skip } = validate(entry);
    const message = `New notification` + (reason ? ` (${reason})` : '');
    logger.log(message, entry);
    if (!skip) {
      history.add(entry.videoId);
      Bot.post(entry.title, entry.link);
    }
    Bot.log.success(message, title, Object.entries(rest), {
      footer: videoId,
      ...(skip && { color: 'MUTED' }),
    });
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
      if (!process.env.HOST) throw new Error('Missing host');
      if (!process.env.PORT) throw new Error('Missing port');
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