import { defineConfig } from 'vitest/config';

export default defineConfig({
  root: '.',
  esbuild: {
    tsconfigRaw: '{}'
  },
  test: {
    clearMocks: true,
    globals: true,
    setupFiles: ['dotenv/config'],
    testTimeout: 20_000
  }
});
