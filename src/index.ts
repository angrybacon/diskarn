import { Bot } from './bot';
import { karnnect } from './karnnect';
import { Server } from './server';

(async () => {
  await Promise.all([Bot.start(), Server.start()]);
  karnnect();
})();

process.on('SIGINT', () => Promise.all([Bot.stop(), Server.stop()]));
process.on('SIGTERM', () => Promise.all([Bot.stop(), Server.stop()]));
