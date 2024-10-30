import { type Bot } from '@discordeno/bot';

import { CHANNELS } from './constants';

const COLORS = {
  DANGER: 0xf44336,
  MUTED: 0x607d8b,
  SUCCESS: 0x00bcd4,
} as const satisfies Record<string, number>;

const FORMATTERS = {
  code: (input: string, language?: 'json') =>
    [`\`\`\`${language || ''}`, input, '```'].join('\n'),
  list: (...inputs: [string, ...string[]]) =>
    inputs.map((input) => `- ${input}`).join('\n'),
  verbatim: (input: string) => `\`${input}\``,
} as const;

export type EmbedOptions = {
  body?: string;
  /** Whether the body should be rendered with a code block. */
  code?: true;
  color?: keyof typeof COLORS;
  fields?: [name: string, value: string][];
  footer?: string;
  timestamp?: string;
  title: string;
};

export const embed = (
  { helpers }: Bot,
  channel: string,
  options: EmbedOptions,
) =>
  helpers.sendMessage(channel, {
    embeds: [
      {
        color: options.color ? COLORS[options.color] : COLORS.MUTED,
        description:
          options.body && options.code
            ? FORMATTERS.code(options.body)
            : options.body,
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
        ...(options.footer && { footer: { text: options.footer } }),
      },
    ],
  });

export const post = (
  { helpers }: Bot,
  channel: string,
  name: string,
  content: string,
) =>
  helpers.createForumThread(channel, {
    autoArchiveDuration: 10080,
    message: { content },
    name,
  });
