import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 90,
        branches: 90,
        functions: 90,
        statements: 90
      },
      exclude: [
        'node_modules/**',
        'src/main.ts',
        'src/app/app.config.ts',
        'src/app/app.routes.ts',
        '**/*.mock.ts',
        '**/*.dto.ts',
        '**/*.routes.ts',
        'src/test-setup.ts'
      ]
    }
  }
});
