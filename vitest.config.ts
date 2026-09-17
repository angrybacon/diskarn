import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    coverage: {
      reportOnFailure: true,
      reporter: ['json', 'json-summary', 'text'],
    },
    mockReset: true,
    reporters: ['dot'],
    setupFiles: ['./vitest.setup.ts'],
  },
});
