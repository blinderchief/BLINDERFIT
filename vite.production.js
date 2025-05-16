// vite.production.js - For production builds only
const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react-swc');
const path = require('path');

// https://vitejs.dev/config/
module.exports = defineConfig({
  server: {
    host: "localhost",
    port: 8080,
    open: true,
  },
  plugins: [react()],
  build: {
    // Disable certain warning types
    rollupOptions: {
      onwarn(warning, warn) {
        // Skip certain warnings
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE' || 
            warning.message.includes('lovable-tagger')) {
          return;
        }
        warn(warning);
      },
    },
  },
  resolve: {
    // Use explicit path resolution instead of aliases for production build
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/components/ui': path.resolve(__dirname, './src/components/ui'),
      '@/contexts': path.resolve(__dirname, './src/contexts'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/integrations': path.resolve(__dirname, './src/integrations'),
    },
  },
});
