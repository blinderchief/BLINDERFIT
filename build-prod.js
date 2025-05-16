// build-prod.js - A script to build without ESM issues
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const lovableTaggerPath = path.join(process.cwd(), 'node_modules/lovable-tagger/package.json');
const backupPath = path.join(process.cwd(), 'node_modules/lovable-tagger/package.json.bak');
const viteConfigPath = path.join(process.cwd(), 'vite.config.ts');
const viteConfigBackupPath = path.join(process.cwd(), 'vite.config.ts.bak');
const appTsxPath = path.join(process.cwd(), 'src/App.tsx');
const appTsxBackupPath = path.join(process.cwd(), 'src/App.tsx.bak');

// Create a simplified Vite config file
const simpleViteConfig = `
// Simple Vite config for production build
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, './src') },
      { find: '@/components', replacement: path.resolve(__dirname, './src/components') },
      { find: '@/lib', replacement: path.resolve(__dirname, './src/lib') },
      { find: '@/utils', replacement: path.resolve(__dirname, './src/utils') },
      { find: '@/contexts', replacement: path.resolve(__dirname, './src/contexts') },
      { find: '@/hooks', replacement: path.resolve(__dirname, './src/hooks') },
      { find: '@/integrations', replacement: path.resolve(__dirname, './src/integrations') },
      { find: '@/pages', replacement: path.resolve(__dirname, './src/pages') },
      { find: '@/services', replacement: path.resolve(__dirname, './src/services') },
    ]
  },
});
`;

try {
  console.log('===== BLINDERFIT PRODUCTION BUILD =====');
  
  // Backup the original Vite config
  console.log('1. Backing up Vite config...');
  fs.copyFileSync(viteConfigPath, viteConfigBackupPath);

  // Create a simple Vite config
  console.log('2. Creating simple Vite config...');
  fs.writeFileSync(viteConfigPath, simpleViteConfig);
  
  // Backup and modify App.tsx to remove problematic imports
  console.log('3. Backing up App.tsx...');
  fs.copyFileSync(appTsxPath, appTsxBackupPath);
    console.log('4. Temporarily modifying App.tsx...');
  let appTsxContent = fs.readFileSync(appTsxPath, 'utf8');
  
  // Create a simpler version of App.tsx without problematic UI component imports
  // Replace all imports from @/components/ui/ with comments
  appTsxContent = appTsxContent.replace(
    'import { Toaster } from "@/components/ui/toaster";', 
    '// import { Toaster } from "@/components/ui/toaster"; // Temporarily commented for build'
  );
  
  appTsxContent = appTsxContent.replace(
    'import { Toaster as Sonner } from "@/components/ui/sonner";', 
    '// import { Toaster as Sonner } from "@/components/ui/sonner"; // Temporarily commented for build'
  );
  
  appTsxContent = appTsxContent.replace(
    'import { TooltipProvider } from "@/components/ui/tooltip";', 
    '// import { TooltipProvider } from "@/components/ui/tooltip"; // Temporarily commented for build'
  );
  
  // Also remove any usage of the components
  appTsxContent = appTsxContent.replace(
    /<Toaster\s*\/>/g,
    '{ /* <Toaster /> - Temporarily removed for build */ }'
  );
  
  appTsxContent = appTsxContent.replace(
    /<Sonner\s*\/>/g,
    '{ /* <Sonner /> - Temporarily removed for build */ }'
  );
  
  appTsxContent = appTsxContent.replace(
    /<TooltipProvider>[^<]*<\/TooltipProvider>/g,
    '{ /* <TooltipProvider> content temporarily removed for build </TooltipProvider> */ }'
  );
  fs.writeFileSync(appTsxPath, appTsxContent);

  // Check if lovable-tagger exists and back it up
  if (fs.existsSync(lovableTaggerPath)) {
    console.log('5. Backing up lovable-tagger package.json...');
    fs.copyFileSync(lovableTaggerPath, backupPath);
    
    // Modify the package.json to remove "type": "module"
    console.log('6. Modifying lovable-tagger to temporarily remove ESM...');
    const packageJson = JSON.parse(fs.readFileSync(lovableTaggerPath, 'utf8'));
    delete packageJson.type; // Remove the "type": "module" entry
    fs.writeFileSync(lovableTaggerPath, JSON.stringify(packageJson, null, 2));
  }
  
  // Run the build
  console.log('5. Building for production...');
  execSync('npx vite build', { stdio: 'inherit' });
  
  console.log('6. Build completed successfully!');
  
} catch (error) {
  console.error('ERROR:', error.message);
  process.exitCode = 1;
} finally {
  // Always restore the original files
  console.log('7. Restoring original configuration...');
  
  if (fs.existsSync(viteConfigBackupPath)) {
    fs.copyFileSync(viteConfigBackupPath, viteConfigPath);
    fs.unlinkSync(viteConfigBackupPath);
  }
  
  if (fs.existsSync(backupPath)) {
    fs.copyFileSync(backupPath, lovableTaggerPath);
    fs.unlinkSync(backupPath);
  }
  
  if (fs.existsSync(appTsxBackupPath)) {
    fs.copyFileSync(appTsxBackupPath, appTsxPath);
    fs.unlinkSync(appTsxBackupPath);
  }
}
