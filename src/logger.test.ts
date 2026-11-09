import { Writable } from 'stream';
import { afterEach, describe, expect, it, vi } from 'vitest';
import winston from 'winston';

// NOTE We mock the logger globally from the Vitest setup
vi.unmock('~/logger');

/** Import a fresh logger and redirect its output to a list of parsed lines */
const capture = async () => {
  vi.resetModules();
  const { logger } = await import('~/logger');
  const lines: unknown[] = [];
  const stream = new Writable({
    write(chunk: Buffer | string, _encoding, callback) {
      const line: unknown = JSON.parse(chunk.toString());
      lines.push(line);
      callback();
    },
  });
  logger.clear().add(new winston.transports.Stream({ stream }));
  return { lines, logger };
};

describe('logger', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should write level, message, scope and metadata', async () => {
    // Given
    const { lines, logger } = await capture();
    // When
    logger.child({ scope: 'test' }).warn('Message', { key: 'value' });
    // Then
    expect(lines).toStrictEqual([
      { key: 'value', level: 'warn', message: 'Message', scope: 'test' },
    ]);
  });

  it('should include the stack for errors', async () => {
    // Given
    const { lines, logger } = await capture();
    // When
    logger.error(new Error('Boom'));
    // Then
    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatchObject({ level: 'error', message: 'Boom' });
    expect(lines[0]).toHaveProperty('stack');
  });

  it('should hide debug entries by default', async () => {
    // Given
    const { lines, logger } = await capture();
    // When
    logger.debug('Hidden');
    // Then
    expect(lines).toHaveLength(0);
  });

  it('should show debug entries when verbose', async () => {
    // Given
    vi.stubEnv('VERBOSE', '1');
    const { lines, logger } = await capture();
    // When
    logger.debug('Shown');
    // Then
    expect(lines).toHaveLength(1);
  });
});
