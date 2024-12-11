import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: '.',
  esbuild: {
    tsconfigRaw: '{}'
  },
  test: {
    environment: 'node',
    setupFiles: ['./src/testing/setup.ts'],
    printConsoleTrace: true,
    clearMocks: true,
    globals: true,
    testTimeout: 120_000, // Timeout for individual tests
    hookTimeout: 120_000, // Timeout for hooks like beforeEach, afterEach
    fileParallelism: false // Disable parallel execution
  }
});
