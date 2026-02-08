import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "localhost",
    port: 8080,
    open: true,
  },
  plugins: [react()],
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, './src') },
      { find: '@/components', replacement: path.resolve(__dirname, './src/components') },
      { find: '@/contexts', replacement: path.resolve(__dirname, './src/contexts') },
      { find: '@/lib', replacement: path.resolve(__dirname, './src/lib') },
      { find: '@/hooks', replacement: path.resolve(__dirname, './src/hooks') },
      { find: '@/utils', replacement: path.resolve(__dirname, './src/utils') },
      { find: '@/pages', replacement: path.resolve(__dirname, './src/pages') },
      { find: '@/integrations', replacement: path.resolve(__dirname, './src/integrations') }
    ]
  },
});

