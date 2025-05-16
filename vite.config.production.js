// vite.config.production.js - Simplified CommonJS config for production
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
  plugins: [
    react()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
