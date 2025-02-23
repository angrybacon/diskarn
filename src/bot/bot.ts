import { ActivityTypes, createBot } from '@discordeno/bot';

import { SERVERS } from './configuration';
import { logger } from './logger';
import { embed, post, type EmbedOptions } from './write';

if (!process.env.TOKEN) throw new Error('Missing token');

const bot = createBot({
  events: {
    ready: (payload) => logger.log('Bot is ready', payload),
  },
  token: process.env.TOKEN,
});

export const Bot = {
  log: (server: keyof typeof SERVERS) => ({
    error: async (title: EmbedOptions['title'], body: EmbedOptions['body']) => {
      try {
        return await embed(bot, SERVERS[server].logs, {
          body,
          code: true,
          color: 'DANGER',
          title,
        });
      } catch (error) {
        logger.error(error);
      }
    },

    success: async (
      title: EmbedOptions['title'],
      body?: EmbedOptions['body'],
      fields?: EmbedOptions['fields'],
      options?: Omit<EmbedOptions, 'body' | 'fields' | 'title'>,
    ) => {
      try {
        return await embed(bot, SERVERS[server].logs, {
          body,
          color: 'SUCCESS',
          fields,
          title,
          ...options,
        });
      } catch (error) {
        logger.error(error);
      }
    },
  }),

  post: async (server: keyof typeof SERVERS, name: string, content: string) => {
    try {
      return await post(bot, SERVERS[server].videos, name, content);
    } catch (error) {
      logger.error(error);
    }
  },

  start: () => bot.start(),

  status: async (state: string) => {
    await bot.gateway.editBotStatus({
      activities: [{ name: 'Ready', state, type: ActivityTypes.Custom }],
      status: 'online',
    });
    logger.log(`New status "${state}"`);
  },

  stop: () => bot.shutdown(),
} as const;
