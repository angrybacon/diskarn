import { Bot } from '../bot/bot';
import { type SERVERS } from '../bot/configuration';
import { CONFIGURATION } from './configuration';
import { logger } from './logger';
import { zNotification, type Notification } from './models';

const history: Record<keyof typeof SERVERS, Set<string>> = {
  KORUMITE: new Set(),
  KORUMITE2: new Set(),
};

const validate = (
  server: keyof typeof SERVERS,
  { title, videoId }: Notification,
  filter?: RegExp,
) => {
  if (history[server].has(videoId)) {
    return { skip: true, reason: 'duplicate' } as const;
  }
  if (filter && !title.match(filter)) {
    return { skip: true, reason: 'filtered' } as const;
  }
  return { skip: false } as const;
};

export const process = (response: unknown) => {
  let server: keyof typeof SERVERS | undefined = undefined;
  try {
    const entry = zNotification.parse(response);
    const { channelId, id, link, title, videoId, ...rest } = entry;
    const configuration = Object.values(CONFIGURATION).find((it) =>
      it.subscriptions.includes(channelId),
    );
    if (!configuration) throw new Error('Missing configuration');
    server = configuration.server;
    const { reason, skip } = validate(server, entry, configuration.filter);
    const message = 'New notification' + (reason ? ` (${reason})` : '');
    logger.log(`[${server}] ${message}`, entry);
    if (!skip) {
      history[server].add(entry.videoId);
      Bot.post(server, entry.title, entry.link);
    }
    Bot.log(server).success(
      message,
      `[${title}](${link})`,
      Object.entries(rest),
      { footer: id, ...(skip && { color: 'MUTED' }) },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : `${error}`;
    logger.error(`[${server}] Could not read notification`, message, response);
    if (server) Bot.log(server).error('Could not read notification', message);
  }
};
