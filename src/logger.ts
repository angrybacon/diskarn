import type { ChalkInstance } from 'chalk';

import { Writable } from 'stream';
import chalk from 'chalk';

const DOMAINS =
  // prettier-ignore
  {
    BOT:      ['bot',      chalk.cyan],
    KARNNECT: ['karnnect', chalk.magenta],
    ROOT:     ['root',     chalk.red],
    SERVER:   ['server',   chalk.yellow],
  } as const satisfies Record<
    Uppercase<string>,
    [Lowercase<string>, ChalkInstance]
  >;

export const Logger = (scope: keyof typeof DOMAINS) => {
  const [domain, colorize] = DOMAINS[scope];
  const prefix = colorize(`[${domain}]`);

  const write = (it: unknown, level: 'debug' | 'error') => {
    if (!process.stdout.isTTY) {
      console[level](prefix, it);
      return;
    }
    let output = '';
    const stream = new Writable({
      write(chunk: Buffer | string, _encoding, callback) {
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
    console[level](prefix, output.trim().replaceAll('\n', `\n${prefix} `));
  };

  return {
    error: (...messages: unknown[]) =>
      messages.forEach((it) => write(it, 'error')),
    log: (...messages: unknown[]) =>
      messages.forEach((it) => write(it, 'debug')),
  };
};
