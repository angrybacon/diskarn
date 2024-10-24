import { type Bot } from '@discordeno/bot';

import { CHANNELS } from './constants';

const COLORS = {
  DANGER: 0xf44336,
  DEFAULT: 0x607d8b,
  SUCCESS: 0x00bcd4,
} as const satisfies Record<string, number>;

export type EmbedOptions = {
  body?: string | [string, ...string[]];
  color?: keyof typeof COLORS;
  fields?: [name: string, value: string][];
  footer?: string;
  timestamp?: string;
  title?: string;
};

export const embed = (
  { helpers }: Bot,
  channel: keyof typeof CHANNELS,
  options: EmbedOptions,
) =>
  helpers.sendMessage(CHANNELS[channel], {
    embeds: [
      {
        color: options.color ? COLORS[options.color] : COLORS.DEFAULT,
        description: (Array.isArray(options.body)
          ? options.body
          : [options.body]
        ).join('\n'),
        fields: options.fields
          ?.map(([name, value]) => ({
            inline: value.length <= 30,
            name,
            value,
          }))
          .sort((a, b) => a.name.localeCompare(b.name))
          .sort((a, b) => Number(a.inline) - Number(b.inline)),
        timestamp: options.timestamp || new Date().toISOString(),
        title: options.title,
        ...(options.footer && { text: options.footer }),
      },
    ],
  });

export const post = (
  { helpers }: Bot,
  channel: keyof typeof CHANNELS,
  name: string,
  content: string,
) =>
  helpers.createForumThread(CHANNELS[channel], {
    autoArchiveDuration: 10080,
    message: { content },
    name,
  });

export const write = (
  { helpers }: Bot,
  channel: keyof typeof CHANNELS,
  ...lines: [string, ...string[]]
) => helpers.sendMessage(CHANNELS[channel], { content: lines.join('\n') });
