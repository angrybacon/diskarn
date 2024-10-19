const CALLBACK_URL = 'https://diskarn.up.railway.app/challenge';
const HUB_URL = 'https://pubsubhubbub.appspot.com';
const TOPIC_URL = 'https://www.youtube.com/xml/feeds/videos.xml?channel_id=';

export const subscribe = (options: {
  id: string;
  secret?: string;
  undo?: boolean;
}) =>
  fetch(HUB_URL, {
    body: new URLSearchParams({
      'hub.callback': CALLBACK_URL,
      'hub.mode': options.undo ? 'unsubscribe' : 'subscribe',
      'hub.topic': `${TOPIC_URL}${options.id}`,
      ...(options.secret && { ['hub.secret']: options.secret }),
    }),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    method: 'POST',
  });
