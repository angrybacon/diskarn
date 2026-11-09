import { inspect } from 'util';
import winston from 'winston';

const { colorize, combine, errors, json, printf } = winston.format;

export const logger = winston.createLogger({
  format:
    process.stdout.isTTY &&
    // NOTE Never colorize in production, even if a TTY happens to be attached
    process.env.NODE_ENV !== 'production'
      ? combine(
          errors({ stack: true }),
          colorize(),
          printf(({ level, message, scope, ...rest }) => {
            const details = Object.keys(rest).length
              ? ` ${inspect(rest, { colors: true, depth: null })}`
              : '';
            return `[${String(scope)}] ${level} ${String(message)}${details}`;
          }),
        )
      : combine(errors({ stack: true }), json()),
  level: process.env.VERBOSE === '1' ? 'debug' : 'info',
  transports: [new winston.transports.Console()],
});
