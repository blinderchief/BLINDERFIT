import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  server: {
    host: "localhost", 
    port: 8080,
    open: true,
  },
  plugins: [react()],  build: {
    // Increase the chunk size warning limit to 2000kb (2MB)
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      // Mark problematic packages as external
      external: ['lovable-tagger'],
      // Implement manual chunking to reduce chunk sizes
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          firebase: [
            'firebase/app', 
            'firebase/auth', 
            'firebase/firestore', 
            'firebase/storage', 
            'firebase/analytics', 
            'firebase/functions'
          ],
          // Remove incorrect ui chunk that tries to import directory
          // Each UI component is imported individually instead
          recharts: ['recharts']
        }
      },
      // Disable warnings about ESM modules
      onwarn(warning, warn) {
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
        warn(warning);
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
