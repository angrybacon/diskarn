import { describe, expect, it, vi } from 'vitest';

import { Bot } from './bot';
import { logger } from './logger';
import { embed, post } from './write';

vi.mock('@discordeno/bot');
vi.mock('./logger');
vi.mock('./write');

// NOTE `bot.ts` reads `TOKEN` at import time
vi.hoisted(() => (process.env.TOKEN = '4815162342'));

describe('Bot', () => {
  describe(Bot.log, () => {
    it('should log an error message', async () => {
      // When
      await Bot.log('KORUMITE').error('Title', 'Body');
      // Then
      expect(embed).toHaveBeenCalledTimes(1);
      expect(embed).toHaveBeenCalledWith(
        undefined,
        expect.any(String),
        expect.objectContaining({ body: 'Body', title: 'Title' }),
      );
    });

    it('should handle errors for error logs', async () => {
      // Given
      vi.mocked(embed).mockRejectedValueOnce('Error');
      // When
      await Bot.log('KORUMITE').error('Title', 'Body');
      // Then
      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith('Error');
    });

    it('should log a successful message', async () => {
      // When
      await Bot.log('KORUMITE').success('Title');
      // Then
      expect(embed).toHaveBeenCalledTimes(1);
      expect(embed).toHaveBeenCalledWith(
        undefined,
        expect.any(String),
        expect.objectContaining({ title: 'Title' }),
      );
    });

    it('should log a successful message with a body', async () => {
      // When
      await Bot.log('KORUMITE').success('Title', 'Body');
      // Then
      expect(embed).toHaveBeenCalledTimes(1);
      expect(embed).toHaveBeenCalledWith(
        undefined,
        expect.any(String),
        expect.objectContaining({ body: 'Body', title: 'Title' }),
      );
    });

    it('should handle errors for success logs', async () => {
      // Given
      vi.mocked(embed).mockRejectedValueOnce('Error');
      // When
      await Bot.log('KORUMITE').success('Title');
      // Then
      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith('Error');
    });
  });

  describe(Bot.post, () => {
    it('should post message', async () => {
      // When
      await Bot.post('KORUMITE', 'Title', 'Body');
      // Then
      expect(post).toHaveBeenCalledTimes(1);
      expect(post).toHaveBeenCalledWith(
        undefined,
        expect.any(String),
        'Title',
        'Body',
      );
    });

    it('should handle errors', async () => {
      // Given
      vi.mocked(post).mockRejectedValueOnce('Error');
      // When
      await Bot.post('KORUMITE', 'Title', 'Body');
      // Then
      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalledWith('Error');
    });
  });
});
