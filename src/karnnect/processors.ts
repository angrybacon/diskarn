import type { Notification } from '~/karnnect/schemas';

import { SERVERS } from '~/bot/configuration';
import { CONFIGURATION } from '~/karnnect/configuration';
import { NotificationSchema } from '~/karnnect/schemas';
import { logger as l } from '~/logger';

const logger = l.child({ scope: 'karnnect' });

export const processChallenge = (response: unknown) => {
  try {
    logger.debug('Received new challenge response', { response });
    const notification = NotificationSchema.parse(response);
    const matches = Object.values(CONFIGURATION).filter(({ subscriptions }) =>
      subscriptions.includes(notification.channelId),
    );
    if (!matches.length) {
      logger.warn('Unhandled notification', { notification });
    }
    return matches.reduce<
      {
        id: string;
        notification: Notification;
        server: keyof typeof SERVERS;
      }[]
    >((accumulator, { filter, server }) => {
      if (filter && !filter.test(notification.title)) {
        logger.debug(`Skipped ${server} notification, title did not match`);
        return accumulator;
      }
      accumulator.push({ id: notification.videoId, notification, server });
      return accumulator;
    }, []);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Could not read notification "${message}"`, { response });
  }
  return [];
};
