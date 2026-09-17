import type { Notification } from '~/karnnect/schemas';

import { SERVERS } from '~/bot/configuration';
import { CONFIGURATION } from '~/karnnect/configuration';
import { logger } from '~/karnnect/logger';
import { NotificationSchema } from '~/karnnect/schemas';

export const processChallenge = (response: unknown) => {
  try {
    if (process.env.VERBOSE === '1') {
      logger.log('Received new challenge response', response);
    }
    const notification = NotificationSchema.parse(response);
    const matches = Object.values(CONFIGURATION).filter(({ subscriptions }) =>
      subscriptions.includes(notification.channelId),
    );
    if (!matches.length) {
      logger.error('Unhandled notification', notification);
    }
    return matches.reduce<
      {
        id: string;
        notification: Notification;
        server: keyof typeof SERVERS;
      }[]
    >((accumulator, { filter, server }) => {
      if (filter && !filter.test(notification.title)) {
        logger.log(`Skipped ${server} notification, title did not match`);
        return accumulator;
      }
      accumulator.push({ id: notification.videoId, notification, server });
      return accumulator;
    }, []);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Could not read notification "${message}"`, response);
  }
  return [];
};
