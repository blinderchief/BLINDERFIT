import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Skip the lovable-tagger import completely if SKIP_TAGGER is set
let componentTaggerFn = null;
if (!process.env.SKIP_TAGGER) {
  try {
    // For development only - this will be skipped in production builds
    console.log("Loading component tagger (development mode only)");
    // This is async but we don't use the result directly, instead we set a flag
    import('lovable-tagger')
      .then(module => {
        componentTaggerFn = module.componentTagger;
      })
      .catch(err => {
        console.warn('Failed to load lovable-tagger:', err);
      });
  } catch (error) {
    console.warn('Error importing lovable-tagger:', error);
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Create a safe version of componentTagger that won't break if the import failed
  const safeComponentTagger = () => {
    if (componentTaggerFn) {
      try {
        return componentTaggerFn();
      } catch (e) {
        console.warn('Error executing componentTagger:', e);
        return null;
      }
    }
    return null;
  };

  return {
    server: {
      host: "localhost", // Changed from "::" to "localhost"
      port: 8080,
      open: true, // Automatically open browser
    },
    plugins: [
      react(),
      mode === 'development' && safeComponentTagger(),
    ].filter(Boolean),
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
  };
});
