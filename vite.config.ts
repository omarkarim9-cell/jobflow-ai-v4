import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
// Explicitly import process to resolve 'cwd' property error in TypeScript environments that do not automatically include Node.js global types.
import process from 'node:process';

export default defineConfig(({ mode }) => {
  // Load environment variables from the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    define: {
      // Shims process.env for production bundling.
      // These will be replaced at build time with values from your .env files or environment.
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ''),
      'process.env.VITE_CLERK_PUBLISHABLE_KEY': JSON.stringify(env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_d2FudGVkLWRpbmdvLTkxLmNsZXJrLmFjY291bnRzLmRldiQ'),
      'process.env': '{}',
      'process.platform': JSON.stringify('browser'),
    },
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          // Standard Vite chunking is safer for Rollup's AST tracing.
          manualChunks: undefined,
        },
      },
    },
  };
});