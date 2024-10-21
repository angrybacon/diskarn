import chalk, { ChalkInstance } from 'chalk';

const DOMAINS =
  // prettier-ignore
  {
    BOT:      ['bot',      chalk.cyan],
    KARNNECT: ['karnnect', chalk.magenta],
    SERVER:   ['server',   chalk.yellow],
  } as const satisfies Record<
    Uppercase<string>,
    [Lowercase<string>, ChalkInstance]
  >;

const stringify = (input: unknown) =>
  JSON.stringify(
    input,
    (_, value) => (typeof value === 'bigint' ? `${value}` : value),
    2,
  );

const prettify = (inputs: unknown[], scope: keyof typeof DOMAINS) => {
  const [domain, colorize] = DOMAINS[scope];
  const prefix = colorize(`[${domain}] `);
  return inputs.map(
    (input, index) =>
      (index ? '' : prefix) +
      (typeof input === 'string' ? input : stringify(input)).replaceAll(
        '\n',
        `\n${prefix}`,
      ),
  );
};

export const Logger = (scope: keyof typeof DOMAINS) => ({
  error: (...inputs: [unknown, ...unknown[]]) =>
    console.error(...prettify(inputs, scope)),
  log: (...inputs: [unknown, ...unknown[]]) =>
    console.info(...prettify(inputs, scope)),
});
