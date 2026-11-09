import type { EmbedOptions } from '~/bot/write';

import { ActivityTypes, createBot } from '@discordeno/bot';

import { SERVERS } from '~/bot/configuration';
import { embed, post } from '~/bot/write';
import { logger as l } from '~/logger';

const logger = l.child({ scope: 'bot' });

if (!process.env.TOKEN) throw new Error('Missing token');

const bot = createBot({
  events: {
    ready: () => logger.info('Bot is ready'),
  },
  token: process.env.TOKEN,
});

export const Bot = {
  log: (server: keyof typeof SERVERS) => ({
    error: async (title: EmbedOptions['title'], body: EmbedOptions['body']) => {
      try {
        await embed(bot, SERVERS[server].logs, {
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
        await embed(bot, SERVERS[server].logs, {
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
      await post(bot, SERVERS[server].videos, name, content);
    } catch (error) {
      logger.error(error);
    }
  },

  start: async () => {
    try {
      await bot.start();
    } catch (error) {
      logger.error(error);
      process.exit(1);
    }
  },

  status: async (state: string) => {
    try {
      await bot.gateway.editBotStatus({
        activities: [{ name: 'Ready', state, type: ActivityTypes.Custom }],
        status: 'online',
      });
      logger.info(`New status "${state}"`);
    } catch (error) {
      logger.error(error);
    }
  },

  stop: () => bot.shutdown(),
} as const;
