import { Bot } from './bot';

const CHANNELS = {
  PirateSoftware: 'UCMnULQ6F6kLDAHxofDWIbrw',
  t3dotgg: 'UCbRP3c757lWg9M-U7TyEkXA',
} as const;

const URLS = {
  CALLBACK: 'https://diskarn.up.railway.app/challenge',
  DIAGNOSE: 'https://pubsubhubbub.appspot.com/subscription-details',
  SUBSCRIBE: 'https://pubsubhubbub.appspot.com',
  TOPIC: 'https://www.youtube.com/xml/feeds/videos.xml?channel_id=',
} as const;

/**
 * Subscribe to the WebSub notifications all of the channels in sequence.
 * Await in each iteration as a cheap way not to care about rate limits.
 * See <https://developers.google.com/youtube/v3/guides/push_notifications>.
 */
export const karnnect = async () => {
  const total = Object.keys(CHANNELS).length;
  let index = 0;
  for (const [name, id] of Object.entries(CHANNELS)) {
    console.info(`[karnnect] Subscribing ${++index}/${total} "${name}"...`);
    if (process.env.SKIP_SUBSCRIPTION === '1') {
      console.info(`[karnnect] Subscribed "${name}" (fake)`);
      continue;
    }
    const lease = 10 * 24 * 60 * 60;
    const { ok, status, statusText } = await subscribe({ id, lease });
    if (!ok) throw new Error(`${status} ${statusText}`);
    console.info(`[karnnect] Subscribed "${name}"`);
  }
  Bot.log({
    fields: Object.entries(CHANNELS).map(([name, id]) => [name, `\`${id}\``]),
    title: `Subscribed ${total} WebSub notifications`,
  });
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
      'hub.topic': `${URLS.TOPIC}${options.id}`,
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
    'hub.topic': `${URLS.TOPIC}${options.id}`,
    ...(options.secret && { ['hub.secret']: options.secret }),
  });
  return fetch(`${URLS.DIAGNOSE}?${query.toString()}`);
};
