import { scheduleJob } from 'node-schedule';

import { Bot } from './bot';
import { karnnect } from './karnnect';
import { Server } from './server';

(async () => {
  await Promise.all([Bot.start(), Server.start()]);
  karnnect();
})();

// NOTE Since YouTube WebSub subscriptions are limited in leasing time, run the
//      subscription routine every Saturday at 10:00.
//      See `karnnect` for the implementation details.
scheduleJob('0 10 * * 6', karnnect);

process.on('SIGINT', () => Promise.all([Bot.stop(), Server.stop()]));
process.on('SIGTERM', () => Promise.all([Bot.stop(), Server.stop()]));
