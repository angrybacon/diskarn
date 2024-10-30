import { Bot } from '../bot/bot';
import { logger } from './logger';
import { zNotification, type Notification } from './models';

const history = new Set<string>();

const validate = ({ videoId }: Notification) => {
  if (history.has(videoId)) {
    return { skip: true, reason: 'duplicate' } as const;
  }
  // TODO Add instance-specific title filters
  return { skip: false } as const;
};

export const process = (response: unknown) => {
  try {
    const entry = zNotification.parse(response);
    const { channelId, link, title, videoId, ...rest } = entry;
    const { reason, skip } = validate(entry);
    const message = `New notification` + (reason ? ` (${reason})` : '');
    logger.log(message, entry);
    if (!skip) {
      history.add(entry.videoId);
      Bot.post(entry.title, entry.link);
    }
    Bot.log.success(message, title, Object.entries(rest), {
      footer: videoId,
      ...(skip && { color: 'MUTED' }),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : `${error}`;
    logger.error('Could not read notification', message, response);
    Bot.log.error('Could not read notification', message);
  }
};
