import { createBot } from '@discordeno/bot';

if (!process.env.TOKEN) {
  throw new Error('Could not find token');
}

// TODO Handle invalid IDs
const CHANNELS = {
  LOGS: '1294803194173456496',
  VIDEOS: '1294371636094701670',
} as const;

const bot = createBot({
  events: {
    ready() {
      console.info('[bot] Bot is ready');
      Bot.log({ title: 'Bot is ready' });
    },
  },
  token: process.env.TOKEN,
});

type Line = string | [text: string, options: { raw: string }];

export const Bot = {
  log: (options: {
    body?: string | [string, ...string[]];
    color?: number;
    fields?: [name: string, value: string][];
    footer?: string;
    timestamp?: string;
    title?: string;
  }) => {
    return bot.helpers.sendMessage(CHANNELS.LOGS, {
      embeds: [
        {
          color: options.color || 0x607d8b,
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
  },

  post: (name: string, content: string) =>
    bot.helpers.createForumThread(CHANNELS.VIDEOS, {
      autoArchiveDuration: 10080,
      message: { content },
      name,
    }),

  start: () => bot.start(),

  stop: () => bot.shutdown(),

  write: (...lines: [Line, ...Line[]]) =>
    bot.helpers.sendMessage(CHANNELS.LOGS, {
      content: lines
        .map((line) => {
          if (typeof line === 'string') return line;
          const [text, options] = line;
          return `\`\`\`${options.raw}\n${text}\n\`\`\``;
        })
        .join('\n'),
    }),
} as const;
