import { createBot } from '@discordeno/bot';

import { embed, post, type EmbedOptions } from '../bot/write';
import { Logger } from '../logger';

if (!process.env.TOKEN) throw new Error('Missing token');

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
      title: EmbedOptions['title'],
      body: EmbedOptions['body'],
      options?: Omit<EmbedOptions, 'body' | 'title'>,
    ) => embed(bot, 'LOGS', { body, color: 'DANGER', title, ...options }),
    success: (
      title: EmbedOptions['title'],
      body?: EmbedOptions['body'],
      fields?: EmbedOptions['fields'],
      options?: Omit<EmbedOptions, 'body' | 'fields' | 'title'>,
    ) =>
      embed(bot, 'LOGS', { body, color: 'SUCCESS', fields, title, ...options }),
  },

  post: (name: string, content: string) => post(bot, 'VIDEOS', name, content),

  start: () => bot.start(),

  stop: () => bot.shutdown(),
} as const;
