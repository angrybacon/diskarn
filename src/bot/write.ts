import { type Bot } from '@discordeno/bot';

import { CHANNELS } from '~/bot/constants';

const COLORS = {
  DANGER: 0xf44336,
  DEFAULT: 0x607d8b,
  SUCCESS: 0x00bcd4,
} as const satisfies Record<string, number>;

export const embed = (
  bot: Bot,
  channel: keyof typeof CHANNELS,
  options: {
    body?: string | [string, ...string[]];
    color?: keyof typeof COLORS;
    fields?: [name: string, value: string][];
    footer?: string;
    timestamp?: string;
    title?: string;
  },
) =>
  bot.helpers.sendMessage(CHANNELS[channel], {
    embeds: [
      {
        color: options.color ? COLORS[options.color] : COLORS.DEFAULT,
        description: (Array.isArray(options.body)
          ? options.body
          : [options.body]
        ).join('\n'),
        fields: options.fields?.map(([name, value]) => ({
          inline: true,
          name,
          value,
        })),
        timestamp: options.timestamp || new Date().toISOString(),
        title: options.title,
        ...(options.footer && { text: options.footer }),
      },
    ],
  });

export const post = (
  bot: Bot,
  channel: keyof typeof CHANNELS,
  name: string,
  content: string,
) =>
  bot.helpers.createForumThread(CHANNELS[channel], {
    autoArchiveDuration: 10080,
    message: { content },
    name,
  });

export const write = (
  bot: Bot,
  channel: keyof typeof CHANNELS,
  ...lines: [string, ...string[]]
) => bot.helpers.sendMessage(CHANNELS[channel], { content: lines.join('\n') });
