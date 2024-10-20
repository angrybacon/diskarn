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
    ready({ applicationId, sessionId }) {
      console.info(`[bot] Session is ready "${sessionId}"`);
      Bot.log(
        '# Session is ready',
        `- Application: \`${applicationId}\``,
        `- Session: \`${sessionId}\``,
      );
    },
  },
  token: process.env.TOKEN,
});

type Line = string | [text: string, options: { raw: string }];

export const Bot = {
  log: (...lines: [Line, ...Line[]]) =>
    bot.helpers.sendMessage(CHANNELS.LOGS, {
      content: lines
        .map((line) => {
          if (typeof line === 'string') return line;
          const [text, options] = line;
          return `\`\`\`${options.raw}\n${text}\n\`\`\``;
        })
        .join('\n'),
    }),
  post: (name: string, content: string) =>
    bot.helpers.createForumThread(CHANNELS.VIDEOS, {
      autoArchiveDuration: 10080,
      message: { content },
      name,
    }),
  start: () => bot.start(),
  stop: () => bot.shutdown(),
} as const;
