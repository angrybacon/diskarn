import { Bot } from './bot';
import { Server } from './server';
import { shutdown } from './shutdown';
import { subscribe } from './subscribe';

const CHANNELS =
  // prettier-ignore
  {
    PirateSoftware: 'UCMnULQ6F6kLDAHxofDWIbrw',
    t3dotgg:        'UCbRP3c757lWg9M-U7TyEkXA',
  };

const main = async () => {
  await Promise.all([Bot.start(), Server.start()]);
  let index = 0;
  for (const [name, id] of Object.entries(CHANNELS)) {
    const total = Object.keys(CHANNELS).length;
    console.log(`Subscribing ${++index}/${total} "${name}"...`);
    // NOTE Await in between as a cheap way not to care about rate limits
    const response = await subscribe({ id });
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
    console.log(`Subscribed "${name}"`);
  }
};

main();

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
