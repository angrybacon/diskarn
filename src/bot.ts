import { createBot } from '@discordeno/bot';

if (!process.env.TOKEN) {
  throw new Error('Could not find token');
}

// TODO Handle invalid IDs
const CHANNELS = {
  LOGS: '1294803194173456496',
  VIDEOS: '1294371636094701670',
} as const;

type Line = string | [text: string, options: { pre: true }];

const bot = createBot({
  events: {
    ready({ applicationId, sessionId }) {
      console.info(`[bot] Session is ready "${sessionId}"`);
      Bot.write(
        `- Application: \`${applicationId}\``,
        `- Session: \`${sessionId}\``,
      );
    },
  },
  token: process.env.TOKEN,
});

export const Bot = {
  post: (name: string, content: string) =>
    bot.helpers.createForumThread(CHANNELS.VIDEOS, {
      autoArchiveDuration: 10080,
      message: { content },
      name,
    }),
  start: () => bot.start(),
  stop: () => bot.shutdown(),
  write: (...lines: [Line, ...Line[]]) =>
    bot.helpers.sendMessage(CHANNELS.LOGS, { content: lines.join('\n') }),
} as const;
