import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/idea-validator/' : '/',
  plugins: [react()],
  test: { environment: 'jsdom', setupFiles: ['./src/test/setup-env.ts', './src/test/setup.ts'] },
}));
