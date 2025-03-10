import { Writable } from 'stream';
import chalk, { type Chalk } from 'chalk';

const DOMAINS =
  // prettier-ignore
  {
    BOT:      ['bot',      chalk.cyan],
    KARNNECT: ['karnnect', chalk.magenta],
    SERVER:   ['server',   chalk.yellow],
  } as const satisfies Record<
    Uppercase<string>,
    [Lowercase<string>, Chalk]
  >;

export const Logger = (scope: keyof typeof DOMAINS) => {
  const [domain, colorize] = DOMAINS[scope];
  const prefix = colorize(`[${domain}] `);

  const write = (it: unknown, level: 'debug' | 'error') => {
    let output = '';
    // NOTE Spawn a new stream for each log because I'm worried that `output`
    //      might be messed up with concurrent calls but too lazy to actually
    //      check whether that's the case.
    //      If memory becomes an issue (it won't), pull it out into `Logger`
    //      directly.
    const stream = new Writable({
      write(chunk, _encoding, callback) {
        output += chunk.toString();
        callback();
      },
    });
    const logger = new console.Console({ stdout: stream });
    output = '';
    if (it instanceof Error) {
      logger.log(it.message);
      logger.dir(it.cause, { depth: null, colors: true });
    } else if (typeof it === 'string') {
      logger.log(it);
    } else {
      logger.dir(it, { depth: null, colors: true });
    }
    console[level](`${prefix}${output.trim().replaceAll('\n', `\n${prefix}`)}`);
  };

  return {
    error: (...messages: unknown[]) =>
      messages.forEach((it) => write(it, 'error')),
    log: (...messages: unknown[]) =>
      messages.forEach((it) => write(it, 'debug')),
  };
};
