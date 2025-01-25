import { SERVERS } from '../bot/configuration';
import { CONFIGURATION } from './configuration';
import { logger } from './logger';
import { zNotification, type Notification } from './models';

const history = (Object.keys(SERVERS) as (keyof typeof SERVERS)[]).reduce(
  (accumulator, name) => {
    return { ...accumulator, [name]: new Set() };
  },
  {} as Record<keyof typeof SERVERS, Set<string>>,
);

export const process = (response: unknown) => {
  try {
    const notification = zNotification.parse(response);
    const configurations = Object.values(CONFIGURATION).filter((it) =>
      it.subscriptions.includes(notification.channelId),
    );
    if (!configurations.length) {
      logger.error('Unhandled notification', notification);
      throw new Error('Unhandled notification');
    }
    return configurations.reduce(
      (accumulator, { filter, server }) => {
        if (filter && !notification.title.match(filter)) {
          logger.log(`Skipped notification for "${server}"`, notification);
          return accumulator;
        }
        logger.log(`New notification for "${server}"`, notification);
        return [...accumulator, { notification, server }];
      },
      [] as { notification: Notification; server: keyof typeof SERVERS }[],
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : `${error}`;
    logger.error('Could not read notification', message, response);
  }
  return [];
};
