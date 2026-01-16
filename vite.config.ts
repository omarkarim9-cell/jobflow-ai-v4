import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
export default defineConfig({
  plugins: [react()],
  resolve: { 
  alias: {
     
    }
  },
  
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'recharts', 'lucide-react'],
          clerk: ['@clerk/clerk-react'],
        },
      },
	   external: [  // ✅ ADD THIS
        '@neondatabase/serverless',
        '@clerk/backend',
        'postgres'
      ]
    },
  },
});