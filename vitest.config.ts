import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: ['**/node_modules/**', '**/dist/**'],
    environmentMatchGlobs: [
      ['packages/react/**/*.test.{ts,tsx}', 'jsdom'],
    ],
  },
});
