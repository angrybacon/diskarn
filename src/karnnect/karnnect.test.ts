import { beforeEach, describe, expect, it, vi } from 'vitest';

import { karnnect } from '~/karnnect/karnnect';

const configuration = vi.hoisted(() => ({ SUBSCRIPTIONS: {} }));

vi.hoisted(() => (process.env.WEBSUB_CALLBACK_DOMAIN = 'protocol://domain'));

vi.mock('~/bot/bot', () => ({
  Bot: {
    log: () => ({ error: () => {}, success: () => {} }),
    status: () => {},
  },
}));

vi.mock('~/karnnect/configuration', () => configuration);

vi.mock('~/karnnect/logger');

describe(karnnect, () => {
  beforeEach(() => {
    configuration.SUBSCRIPTIONS = { TEST_CHANNEL: 'A'.repeat(24) };
  });

  it('should not throw when a subscribe request fails', async () => {
    // Given
    const response = new Response('', { status: 503, statusText: 'Error' });
    vi.mocked(fetch).mockResolvedValueOnce(response);
    // When
    const result = karnnect();
    // Then
    await expect(result).resolves.not.toThrow();
  });
});
