const CHANNELS = {
  PirateSoftware: 'UCMnULQ6F6kLDAHxofDWIbrw',
  t3dotgg: 'UCbRP3c757lWg9M-U7TyEkXA',
} as const;

const URLS = {
  CALLBACK: 'https://diskarn.up.railway.app/challenge',
  HUB: 'https://pubsubhubbub.appspot.com',
  TOPIC: 'https://www.youtube.com/xml/feeds/videos.xml?channel_id=',
} as const;

export const karnnect = async () => {
  let index = 0;
  for (const [name, id] of Object.entries(CHANNELS)) {
    const total = Object.keys(CHANNELS).length;
    console.info(`[karnnect] Subscribing ${++index}/${total} "${name}"...`);
    if (process.env.SKIP_SUBSCRIPTION === '1') {
      console.info(`[karnnect] Subscribed "${name}" (fake)`);
      continue;
    }
    // TODO Refresh subscriptions automatically
    // NOTE Await in between as a cheap way not to care about rate limits
    const response = await subscribe({ id });
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
    console.info(`[karnnect] Subscribed "${name}"`);
  }
};

/**
 * Subscribe or unsubscribe to a specific channel WebSub notifications.
 * See https://developers.google.com/youtube/v3/guides/push_notifications.
 */
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
  fetch(URLS.HUB, {
    body: new URLSearchParams({
      'hub.callback': URLS.CALLBACK,
      'hub.mode': options.undo ? 'unsubscribe' : 'subscribe',
      'hub.topic': `${URLS.TOPIC}${options.id}`,
      ...(options.lease && { ['hub.lease_numbers']: `${options.lease}` }),
      ...(options.secret && { ['hub.secret']: options.secret }),
      ...(options.token && { ['hub.verify_token']: options.token }),
      ...(options.verify && { ['hub.verify']: options.verify }),
    }),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    method: 'POST',
  });
