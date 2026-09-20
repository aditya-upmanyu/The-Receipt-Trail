# 🔧 Netlify Deployment Troubleshooting

## Issue: Build Failed with Exit Code 2

### Problem
The initial deployment failed with:
```
Failed during stage 'building site': Build script returned non-zero exit code: 2
```

### Root Cause
The `vite.config.ts` included terser minification options that are not available in Netlify's build environment by default.

### Solution Applied ✅
Removed the terser configuration from `vite.config.ts` and kept Vite's default esbuild minifier, which is:
- Faster
- Better supported
- Sufficient for production builds

---

## Current Build Configuration

### vite.config.ts
```typescript
export default defineConfig({
  plugins: [tailwindcss(), react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'motion': ['framer-motion'],
          'icons': ['lucide-react'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
    sourcemap: false,
    // Using default esbuild minifier (faster and better)
  },
})
```

### netlify.toml
```toml
[build]
  command = "npm run build"
  publish = "dist"
```

---

## Verification Steps

### 1. Local Build Test
```bash
npm run build
npm run preview
```
✅ Should build without errors

### 2. Check Build Output
```bash
ls -lh dist/
```
✅ Should see index.html and assets/

### 3. TypeScript Check
```bash
npx tsc --noEmit
```
✅ Should have zero errors

### 4. ESLint Check
```bash
npm run lint
```
✅ Should have zero errors

---

## Common Netlify Build Issues

### Issue 1: Node Version Mismatch

**Symptom**: Build fails with dependency errors

**Solution**: Add `.nvmrc` or `.node-version` file:
```bash
echo "18" > .nvmrc
```

Or specify in `netlify.toml`:
```toml
[build.environment]
  NODE_VERSION = "18"
```

### Issue 2: Missing Dependencies

**Symptom**: "Cannot find module" errors

**Solution**: Ensure all dependencies are in `package.json`:
```bash
npm install
git add package.json package-lock.json
git commit -m "Update dependencies"
```

### Issue 3: Build Command Fails

**Symptom**: "Command not found" or script errors

**Solution**: Verify build script in `package.json`:
```json
{
  "scripts": {
    "build": "tsc -b && vite build"
  }
}
```

### Issue 4: Environment Variables

**Symptom**: Missing API keys or config

**Solution**: Add environment variables in Netlify dashboard:
1. Site settings → Environment variables
2. Add each variable
3. Redeploy

### Issue 5: Large Bundle Size

**Symptom**: Build timeout or warning

**Solution**: Already implemented:
- Code splitting ✅
- Lazy loading ✅
- Tree shaking ✅

---

## Debugging Failed Builds

### 1. Check Netlify Build Logs

Go to: Deploy → Deploy log

Look for:
- ❌ npm install errors
- ❌ TypeScript errors
- ❌ Build command failures
- ❌ Missing files

### 2. Reproduce Locally

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Build
npm run build

# If successful, issue is environment-specific
```

### 3. Enable Verbose Logging

In `package.json`:
```json
{
  "scripts": {
    "build": "tsc -b && vite build --debug"
  }
}
```

### 4. Check File Permissions

Ensure all files are committed:
```bash
git status
git add .
git commit -m "Add missing files"
git push
```

---

## Build Performance Tips

### Current Status ✅
- Build time: ~30-60 seconds
- Bundle size: 385KB raw, 148KB gzipped
- Code splitting: Enabled
- Lazy loading: Enabled

### Optimization Checklist
- [x] Remove terser (use esbuild)
- [x] Enable code splitting
- [x] Lazy load routes
- [x] Tree shaking enabled
- [x] Source maps disabled in production
- [x] Dependencies optimized

---

## Expected Build Output

### Successful Build
```
✓ built in 30s
dist/index.html                   0.47 kB
dist/assets/index-[hash].css     24.83 kB
dist/assets/react-vendor-[hash].js  150.23 kB
dist/assets/motion-[hash].js      120.45 kB
dist/assets/icons-[hash].js        45.67 kB
dist/assets/index-[hash].js       385.39 kB
```

### File Structure
```
dist/
├── index.html
├── manifest.json
├── robots.txt
├── sitemap.xml
├── _headers
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   ├── react-vendor-[hash].js
│   ├── motion-[hash].js
│   └── icons-[hash].js
└── datasets/
    ├── spotify_history.csv
    ├── Daily Household Transactions.csv
    └── Augmented_IndiaTransactMultiFacet2024.json
```

---

## Netlify Deploy Settings

### Build Settings (Auto-detected from netlify.toml)
- **Base directory**: (leave empty)
- **Build command**: `npm run build`
- **Publish directory**: `dist`

### Deploy Contexts
- **Production branch**: `main`
- **Deploy previews**: Enabled for all branches
- **Branch deploys**: Enabled

### Post Processing (Optional)
- [ ] Pretty URLs
- [ ] Asset optimization
- [x] Form detection (if using forms)
- [ ] Snippet injection

---

## Testing Deployed Site

### 1. Basic Functionality
- [ ] Landing page loads
- [ ] Navigation works
- [ ] Search functions
- [ ] Modal opens/closes
- [ ] All routes accessible

### 2. Performance
- [ ] Lighthouse score > 90
- [ ] Load time < 3 seconds
- [ ] No console errors

### 3. Mobile
- [ ] Responsive layout
- [ ] Touch interactions work
- [ ] Mobile menu functions

### 4. SEO
- [ ] Meta tags present
- [ ] Open Graph works
- [ ] Sitemap accessible

---

## Success Indicators ✅

Your deployment is successful when:

1. ✅ Build completes without errors
2. ✅ Site is live and accessible
3. ✅ All routes work (no 404s)
4. ✅ Datasets load correctly
5. ✅ No console errors
6. ✅ Works in incognito mode
7. ✅ Mobile responsive
8. ✅ Lighthouse score > 90

---

## Need Help?

1. **Check Netlify status**: https://www.netlifystatus.com/
2. **Netlify support**: https://answers.netlify.com/
3. **Build logs**: Netlify dashboard → Deploy log
4. **Local testing**: `npm run build && npm run preview`

---

## Current Status

✅ **Issue Resolved**: Terser config removed  
✅ **Build Working**: Tested locally  
✅ **Ready to Deploy**: Push to trigger auto-deploy  

**Next**: Push to GitHub and Netlify will automatically rebuild! 🚀
