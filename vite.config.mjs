import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Use dynamic import for the ESM-only package
const getConfig = async () => {
  let componentTaggerPlugin = null;
  
  try {
    if (process.env.NODE_ENV === 'development') {
      const { componentTagger } = await import("lovable-tagger");
      componentTaggerPlugin = componentTagger();
    }
  } catch (error) {
    console.warn("Failed to load componentTagger:", error);
  }
  
  return defineConfig({
    server: {
      host: "localhost", 
      port: 8080,
      open: true,
    },
    plugins: [
      react(),
      componentTaggerPlugin
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  });
};

export default getConfig();
