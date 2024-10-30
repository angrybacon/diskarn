import { Bot } from '../bot/bot';
import { SERVERS } from '../bot/configuration';
import { SUBSCRIPTIONS } from './configuration';
import { logger } from './logger';
import { zSubscriptions } from './models';

if (!process.env.WEBSUB_CALLBACK_DOMAIN)
  throw new Error('Missing callback domain');

const URLS = {
  CALLBACK: `${process.env.WEBSUB_CALLBACK_DOMAIN}/challenge`,
  DIAGNOSE: 'https://pubsubhubbub.appspot.com/subscription-details',
  SUBSCRIBE: 'https://pubsubhubbub.appspot.com',
  TOPIC: 'https://www.youtube.com/xml/feeds/videos.xml',
} as const;

/**
 * Subscribe to the WebSub notifications all of the channels in sequence.
 * Await in each iteration as a cheap way not to care about rate limits.
 * See <https://developers.google.com/youtube/v3/guides/push_notifications>.
 */
export const karnnect = async () => {
  const subscriptions = zSubscriptions.parse(SUBSCRIPTIONS);
  if (process.env.SKIP_SUBSCRIPTION === '1') {
    logger.log(`Dry-configured new subscriptions`, subscriptions);
    return;
  }
  for (const [name, id] of Object.entries(subscriptions)) {
    const lease = 10 * 24 * 60 * 60;
    const { ok, status, statusText } = await subscribe({ id, lease });
    if (!ok) throw new Error(`${status} ${statusText}`);
    logger.log(`Subscribed "${name}"`);
  }
  return Promise.all([
    ...Object.keys(SERVERS).map((server) =>
      Bot.log(server as keyof typeof SERVERS).success(
        'Configured new subscriptions',
        '',
        Object.entries(subscriptions),
      ),
    ),
    Bot.status(`Watching ${Object.keys(subscriptions).length} subscriptions`),
  ]);
};

/** Subscribe or unsubscribe to a specific channel WebSub notifications */
const subscribe = (options: {
  /** The ID of the YouTube channel to subscribe to */
  id: string;
  /** Lease duration in seconds */
  lease?: number;
  /** HMAC secret */
  secret?: string;
  /** Verify token */
  token?: string;
  /** Whether you should unsubscribe instead */
  undo?: boolean;
  /** Verify type */
  verify?: 'async' | 'sync';
}) =>
  fetch(URLS.SUBSCRIBE, {
    body: new URLSearchParams({
      'hub.callback': URLS.CALLBACK,
      'hub.mode': options.undo ? 'unsubscribe' : 'subscribe',
      'hub.topic': `${URLS.TOPIC}?channel_id=${options.id}`,
      ...(options.lease && { ['hub.lease_seconds']: `${options.lease}` }),
      ...(options.secret && { ['hub.secret']: options.secret }),
      ...(options.token && { ['hub.verify_token']: options.token }),
      ...(options.verify && { ['hub.verify']: options.verify }),
    }),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    method: 'POST',
  });

/**
 * Inspect the current state for the provided subscription.
 * Unfortunately YouTube's implementation is not WebSub-compliant and in
 * addition to return nothing on subscription, yields HTML instead of JSON for
 * the diagnostic endpoint.
 */
const diagnose = (options: {
  /** The ID of the YouTube channel to diagnose */
  id: string;
  /** HMAC secret */
  secret?: string;
}) => {
  const query = new URLSearchParams({
    'hub.callback': URLS.CALLBACK,
    'hub.topic': `${URLS.TOPIC}?channel_id=${options.id}`,
    ...(options.secret && { ['hub.secret']: options.secret }),
  });
  return fetch(`${URLS.DIAGNOSE}?${query.toString()}`);
};
