import type { Mock } from 'vitest';

import { beforeEach, vi } from 'vitest';

vi.mock('~/logger', () => {
  const logger: Record<string, Mock> = {
    child: vi.fn<() => unknown>(() => logger),
    debug: vi.fn<() => void>(),
    error: vi.fn<() => void>(),
    http: vi.fn<() => void>(),
    info: vi.fn<() => void>(),
    silly: vi.fn<() => void>(),
    verbose: vi.fn<() => void>(),
    warn: vi.fn<() => void>(),
  };
  return { logger };
});

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});
