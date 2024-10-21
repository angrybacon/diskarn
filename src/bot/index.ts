import { createBot } from '@discordeno/bot';

import { embed, post } from '~/bot/write';
import { Logger } from '~/logger';

if (!process.env.TOKEN) {
  throw new Error('Could not find token');
}
const logger = Logger('BOT');

const bot = createBot({
  events: {
    ready: (payload) => logger.log('Bot is ready', payload),
  },
  token: process.env.TOKEN,
});

export const Bot = {
  log: {
    error: (
      title: string,
      body?: string | [string, ...string[]],
      fields?: [name: string, value: string][],
    ) => embed(bot, 'LOGS', { body, color: 'DANGER', fields, title }),
    success: (
      title: string,
      body?: string | [string, ...string[]],
      fields?: [name: string, value: string][],
    ) => embed(bot, 'LOGS', { body, color: 'SUCCESS', fields, title }),
  },

  post: (name: string, content: string) => post(bot, 'VIDEOS', name, content),

  start: () => bot.start(),

  stop: () => bot.shutdown(),
} as const;
