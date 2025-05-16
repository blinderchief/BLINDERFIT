// production-build.js - Script to handle ESM issues in production builds
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Create a minimal vite config for production
const minimalViteConfig = `
// Minimal vite config for production builds
const { defineConfig } = require('vite');
const react = require('@vitejs/plugin-react-swc');
const path = require('path');

module.exports = defineConfig({
  plugins: [react()],
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
`;

// Backup function
function backupFile(filePath) {
  const backupPath = `${filePath}.bak`;
  console.log(`Backing up ${filePath} to ${backupPath}`);
  
  if (fs.existsSync(filePath)) {
    fs.copyFileSync(filePath, backupPath);
    return backupPath;
  }
  return null;
}

// Restore function
function restoreFile(backupPath, originalPath) {
  if (backupPath && fs.existsSync(backupPath)) {
    console.log(`Restoring ${originalPath} from ${backupPath}`);
    fs.copyFileSync(backupPath, originalPath);
    fs.unlinkSync(backupPath);
  }
}

// Fix and build
async function buildForProduction() {
  const viteConfigPath = path.join(process.cwd(), 'vite.config.ts');
  const viteConfigBackupPath = backupFile(viteConfigPath);
  const tempViteConfigPath = path.join(process.cwd(), 'vite.temp.js');
  
  try {
    // Write minimal vite config
    fs.writeFileSync(tempViteConfigPath, minimalViteConfig);
    console.log('Created temporary Vite config for production build');
    
    // Run build with temporary config
    console.log('Building for production...');
    execSync(`npx vite build --config ${tempViteConfigPath}`, { stdio: 'inherit' });
    console.log('Build completed successfully');
    
    return true;
  } catch (error) {
    console.error('Build failed:', error.message);
    return false;
  } finally {
    // Clean up
    if (fs.existsSync(tempViteConfigPath)) {
      fs.unlinkSync(tempViteConfigPath);
    }
    
    restoreFile(viteConfigBackupPath, viteConfigPath);
  }
}

// Main execution
(async () => {
  console.log('=== BLINDERFIT PRODUCTION BUILD ===');
  
  const success = await buildForProduction();
  
  if (success) {
    console.log('=== BUILD SUCCESSFUL ===');
    process.exit(0);
  } else {
    console.error('=== BUILD FAILED ===');
    process.exit(1);
  }
})();
