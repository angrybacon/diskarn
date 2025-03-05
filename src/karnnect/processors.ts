import { z } from 'zod';

import { SERVERS } from '../bot/configuration';
import { CONFIGURATION } from './configuration';
import { logger } from './logger';
import { zNotification } from './models';

export const processChallenge = (response: unknown) => {
  try {
    if (process.env.VERBOSE === '1') {
      logger.log('Received new challenge response', response);
    }
    const notification = zNotification.parse(response);
    const matches = Object.values(CONFIGURATION).filter(({ subscriptions }) =>
      subscriptions.includes(notification.channelId),
    );
    if (!matches.length) {
      logger.error('Unhandled notification', notification);
    }
    return matches.reduce(
      (accumulator, { filter, server }) => {
        if (filter && !filter.test(notification.title)) {
          logger.log(
            `Skipped ${server} notification, title did not match`,
            `  Author: "${notification.author}"`,
            `  Title: "${notification.title}"`,
          );
          return accumulator;
        }
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
