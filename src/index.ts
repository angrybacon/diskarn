import { scheduleJob } from 'node-schedule';

import { Bot } from '~/bot/bot';
import { karnnect } from '~/karnnect/karnnect';
import { Logger } from '~/logger';
import { Server } from '~/server/server';

const logger = Logger('ROOT');

process.on('uncaughtException', (error) => {
  logger.error(error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => logger.error(reason));

await Promise.all([Bot.start(), Server.start()]);

void karnnect();

// NOTE Since YouTube WebSub subscriptions are limited in leasing time, run the
//      subscription routine every Saturday at 10:00.
//      See `karnnect` for the implementation details.
scheduleJob('0 10 * * 6', karnnect);

process.on('SIGINT', () => void Promise.all([Bot.stop(), Server.stop()]));

process.on('SIGTERM', () => void Promise.all([Bot.stop(), Server.stop()]));
