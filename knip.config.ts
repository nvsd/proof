import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  /**
   * ---------- Plugin configurations ----------
   * Knip should detect most plugins automatically.
   * If it doesn't, add them here.
   */

  /**
   * ---------- Default ----------
   * Vite
   * ESLint
   * Tailwind
   * Playwright
   * Typescript
   */

  // Project files to analyze
  project: ['src/**/*.{ts,tsx}', 'tests/**/*.ts', 'infra/**/*.ts'],

  // TanStack Start entry points currently defaults don't exist
  entry: [
    // Core TanStack Start files
    'vite.config.{js,ts,cjs,mjs}',
    'src/client.{ts,tsx}',
    'src/server.{ts,tsx}',
    'src/router.{ts,tsx}',
    'src/routeTree.gen.ts',

    // TanStack Start routing patterns
    'src/routes/__root.{ts,tsx}',
    'src/routes/**/index.{ts,tsx}',
    'src/routes/**/*.{ts,tsx}',

    // Middleware files (TanStack Start equivalent)
    'src/middleware.{js,ts}',
    'src/global-middleware.{js,ts}',
  ],

  // Ignore patterns for files that shouldn't be analyzed
  ignore: [
    // Generated files
    'drizzle/**/*',

    // Build outputs
    '.sst/**/*',
    'dist/**/*',
    'test-results/**/*',
    'tests/.auth/**/*',

    // Dependencies
    'node_modules/**/*',
  ],
};

export default config;
