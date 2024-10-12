import { Bot } from './bot';
import { Server } from './server';

export const shutdown = () => {
  Bot.stop();
  Server.stop();
};
