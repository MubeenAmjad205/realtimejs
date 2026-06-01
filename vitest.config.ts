import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: ['**/node_modules/**', '**/dist/**'],
    // @ts-expect-error environmentMatchGlobs is a valid property in recent vitest versions
    environmentMatchGlobs: [
      ['packages/react/**/*.test.{ts,tsx}', 'jsdom'],
    ],
  },
});
