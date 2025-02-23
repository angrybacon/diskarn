import { z } from 'zod';

import { SERVERS } from '../bot/configuration';
import { CONFIGURATION } from './configuration';
import { logger } from './logger';
import { zNotification } from './models';

export const process = (response: unknown) => {
  try {
    const notification = zNotification.parse(response);
    const matches = Object.values(CONFIGURATION).filter(({ subscriptions }) =>
      subscriptions.includes(notification.channelId),
    );
    if (!matches.length) {
      logger.error('Unhandled notification', notification);
    }
    return matches.reduce(
      (accumulator, { filter, server }) => {
        if (filter && !notification.title.match(filter)) {
          logger.log(`Skipped notification for "${server}"`, notification);
          return accumulator;
        }
        logger.log(`New notification for "${server}"`, notification);
        return [
          ...accumulator,
          { id: notification.videoId, notification, server },
        ];
      },
      [] as {
        id: string;
        notification: z.infer<typeof zNotification>;
        server: keyof typeof SERVERS;
      }[],
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : `${error}`;
    logger.error(`Could not read notification "${message}"`, response);
  }
  return [];
};
