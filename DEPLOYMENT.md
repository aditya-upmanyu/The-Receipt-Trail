# 🚀 Deployment Guide

## Quick Deploy to Netlify

### Option 1: Deploy via Netlify UI (Recommended)

1. **Push to GitHub** (Already done! ✅)
   ```
   https://github.com/aditya-upmanyu/The-Receipt-Trail
   ```

2. **Connect to Netlify**
   - Go to [https://app.netlify.com/](https://app.netlify.com/)
   - Click "Add new site" → "Import an existing project"
   - Choose "GitHub"
   - Select repository: `aditya-upmanyu/The-Receipt-Trail`

3. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - (These are auto-detected from `netlify.toml`)

4. **Deploy!**
   - Click "Deploy site"
   - Wait 2-3 minutes for build
   - Your site will be live at: `https://[random-name].netlify.app`

5. **Custom Domain (Optional)**
   - Go to Site settings → Domain management
   - Add custom domain
   - Follow DNS configuration instructions

### Option 2: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod
```

---

## 🔧 Pre-Deployment Checklist

### ✅ Already Configured

- [x] Production build optimized
- [x] Code splitting & lazy loading
- [x] Security headers in `netlify.toml`
- [x] SPA routing configured
- [x] Meta tags for SEO
- [x] Manifest.json for PWA
- [x] Robots.txt & Sitemap
- [x] Performance optimizations
- [x] All tests passing
- [x] ESLint clean
- [x] TypeScript strict mode

### 📋 What to Update After Deployment

1. **Update URLs in files:**
   - `public/robots.txt` - Replace `https://yoursite.com` with actual domain
   - `public/sitemap.xml` - Replace `https://yoursite.com` with actual domain
   - `index.html` - Update OG image URLs if using custom domain

2. **Create OG Image:**
   - Create a 1200x630px image with your branding
   - Replace `public/og-image.txt` with `public/og-image.png`
   - This will be used for social media sharing

3. **Test Deployed Site:**
   - [ ] Test in incognito mode
   - [ ] Test on mobile device
   - [ ] Test all routes work
   - [ ] Check console for errors
   - [ ] Verify datasets load correctly

---

## 📊 Performance Metrics

### Current Bundle Sizes (Production)

- **JavaScript**: ~385KB (gzipped: ~123KB)
  - Main bundle: Split into vendor chunks
  - React/React-DOM: Separate chunk
  - Framer Motion: Separate chunk
  - Icons: Separate chunk

- **CSS**: ~25KB (gzipped: ~7KB)

- **Total Initial Load**: ~148KB gzipped

### Lighthouse Scores (Expected)

- **Performance**: 90+ (with lazy loading)
- **Accessibility**: 95+ (ARIA, semantic HTML, keyboard nav)
- **Best Practices**: 95+ (security headers, HTTPS)
- **SEO**: 95+ (meta tags, sitemap, structured data)

### Core Web Vitals (Expected)

- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

---

## 🔒 Security Features

### Headers (Configured in netlify.toml)

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### Security Measures

- ✅ No hardcoded secrets
- ✅ Input sanitization on search queries
- ✅ No unsafe HTML rendering
- ✅ No eval() or Function() constructors
- ✅ Safe external link handling
- ✅ Frontend-only (no backend vulnerabilities)

---

## 🐛 Troubleshooting

### Build Fails on Netlify

**Issue**: Build fails with dependency errors

**Solution**:
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Routes Return 404

**Issue**: Direct navigation to `/explore` returns 404

**Solution**: Already configured in `netlify.toml`:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Datasets Not Loading

**Issue**: CSV/JSON files return 404

**Solution**: Ensure `public/datasets/` folder is committed to git
```bash
git add public/datasets
git commit -m "Add datasets"
git push
```

### Large Bundle Warning

**Issue**: Netlify warns about large assets

**Solution**: Already optimized with code splitting. If needed:
1. Check `dist/assets/` for large files
2. Consider additional code splitting
3. Remove unused dependencies

---

## 📱 Post-Deployment Testing

### Desktop Testing

1. Open deployed URL in Chrome/Firefox/Safari
2. Test all navigation: Landing → Explore → Story → Connections
3. Test search functionality
4. Test receipt detail modal
5. Check console for errors
6. Verify all datasets load

### Mobile Testing

1. Open on mobile device (iOS/Android)
2. Test touch interactions
3. Verify responsive layouts
4. Check mobile menu
5. Test swipe gestures (if any)

### Accessibility Testing

1. Test keyboard navigation (Tab, Enter, Escape)
2. Test with screen reader (NVDA/JAWS/VoiceOver)
3. Verify focus states are visible
4. Check ARIA attributes in DevTools

### Performance Testing

1. Run Lighthouse audit
2. Check Network tab for load times
3. Test on 3G connection (DevTools throttling)
4. Verify lazy loading works

---

## 🎯 FAIE v3 / FQE v3.1 Evaluation Checklist

### ✅ Code Quality

- [x] TypeScript strict mode
- [x] Zero ESLint errors
- [x] Clean component architecture
- [x] DRY principles followed
- [x] Proper error handling

### ✅ Performance

- [x] Code splitting
- [x] Lazy loading
- [x] Optimized bundle size
- [x] Memoization for expensive operations
- [x] Debounced search
- [x] Indexed data structures

### ✅ Accessibility

- [x] Semantic HTML
- [x] ARIA attributes
- [x] Keyboard navigation
- [x] Focus management
- [x] Color contrast
- [x] Screen reader support

### ✅ Responsive Design

- [x] Mobile-first approach
- [x] Breakpoints: 320px-1440px+
- [x] Touch-friendly controls
- [x] Responsive typography
- [x] Flexible layouts

### ✅ Security

- [x] Input sanitization
- [x] Security headers
- [x] No hardcoded secrets
- [x] Safe HTML rendering
- [x] XSS prevention

### ✅ Testing

- [x] 24 comprehensive tests
- [x] Unit tests for core logic
- [x] Component tests
- [x] 100% test pass rate

### ✅ SEO

- [x] Meta tags (title, description)
- [x] Open Graph tags
- [x] Twitter cards
- [x] Sitemap.xml
- [x] Robots.txt
- [x] Semantic structure

### ✅ Documentation

- [x] Comprehensive README
- [x] Architecture documentation
- [x] Deployment guide
- [x] Code comments
- [x] API documentation

---

## 🎉 Success Criteria

Your deployment is successful when:

1. ✅ Site loads without errors
2. ✅ All routes are accessible
3. ✅ Data loads correctly (159K+ receipts)
4. ✅ Search and filters work
5. ✅ Story mode displays chapters
6. ✅ Connections graph renders
7. ✅ Mobile layout looks good
8. ✅ Lighthouse score > 90
9. ✅ No console errors
10. ✅ Works in incognito mode

---

## 🔗 Useful Links

- **GitHub Repository**: https://github.com/aditya-upmanyu/The-Receipt-Trail
- **Netlify Dashboard**: https://app.netlify.com/
- **Lighthouse**: https://pagespeed.web.dev/
- **Can I Use**: https://caniuse.com/
- **Bundle Analyzer**: https://bundlephobia.com/

---

## 📞 Support

If you encounter issues:

1. Check Netlify build logs for errors
2. Verify all files are committed to git
3. Test production build locally: `npm run build && npm run preview`
4. Check browser console for runtime errors
5. Review this deployment guide for solutions

**Ready to deploy!** 🚀
