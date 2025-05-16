// basic-vite.config.js - A minimal config for production builds
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Disable tree-shaking for problematic modules
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    // Ignore warnings about ESM/CJS mixing
    rollupOptions: {
      onwarn(warning, warn) {
        // Ignore certain warnings
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE' || 
            warning.message.includes('lovable-tagger')) {
          return;
        }
        warn(warning);
      },
    },
  },
});
