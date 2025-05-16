# BlinderFit Deployment Notes

## ESM Module Compatibility Fix

The project experienced issues with ESM module compatibility during the production build process. Specifically, the "lovable-tagger" package was causing problems because it's an ESM-only module that was being imported in the vite.config.ts file.

### Problem

1. **lovable-tagger** is a development dependency that uses ESM module format (`"type": "module"` in its package.json)
2. When building for production, Vite was trying to load this module with CommonJS's `require()`, causing an error:
   ```
   "lovable-tagger" resolved to an ESM file. ESM file cannot be loaded by require()
   ```

### Solution

We created a simplified `vite.config.js` file that:

1. Uses CommonJS syntax for compatibility
2. Marks 'lovable-tagger' as an external dependency in the rollupOptions
3. Disables certain warnings related to module type conflicts
4. Provides proper alias resolution for the '@' import paths

This allows the production build to succeed by effectively ignoring the problematic ESM-only package during the build process.

### Deployment Process

1. Use the regular `npm run build` command which now uses our fixed configuration
2. The `deploy-production.bat` script has been updated to use this command
3. The production domain is now properly set to blinderfit.blinder.live

## Domain Configuration

All references to domain names were updated from `blinder.blinder.live` to `blinderfit.blinder.live` throughout the project:

1. Firebase hosting target is now `blinderfit-live` (instead of `blinder-live`)
2. CORS whitelist includes the correct production domain
3. API configuration uses the correct domain
4. All documentation references have been updated

## Future Considerations

If you need to add or modify UI components that use the '@/components/ui/' path, be aware of the potential import resolution issues during the build process. Make sure all components are correctly aliased in the vite.config.js file.

If you reinstall or update the "lovable-tagger" package, you might need to revisit the build configuration to ensure it continues working correctly.
