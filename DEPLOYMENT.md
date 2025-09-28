# Deployment Guide - CollabWork Platform

This guide provides step-by-step instructions for deploying the CollabWork platform to Vercel.

## Prerequisites

- Node.js 18+ and npm installed
- Vercel account (free tier is sufficient)
- Git repository (recommended for automatic deployments)

## Configuration

The application is pre-configured with the production API endpoint. No environment variables are required.

## Deployment Options

### Option 1: Vercel CLI (Fastest)

1. Install the Vercel CLI:
```bash
npm i -g vercel
```

2. Build the project:
```bash
npm run build
```

3. Deploy:
```bash
vercel --prod
```

4. When prompted:
   - Set up and deploy: `Y`
   - Link to existing project: Choose based on your needs
   - Project name: `collabwork-platform`
   - Directory: `./`
   - Build settings: Accept defaults

5. Deploy will complete automatically

### Option 2: GitHub Integration (Recommended for Teams)

1. Push code to GitHub repository

2. Visit [Vercel Dashboard](https://vercel.com/dashboard)

3. Click "Add New Project" → "Import Git Repository"

4. Select your repository

5. Configure project:
   - Framework Preset: `Next.js`
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Install Command: `npm install`

6. Click "Deploy"

### Option 3: Manual Upload

1. Build locally:
```bash
npm run build
npm run export  # if static export is needed
```

2. Visit Vercel Dashboard
3. Drag project folder to upload area
4. Deploy

## Configuration

### Domain Configuration

1. In Vercel Dashboard → Settings → Domains
2. Add custom domain:
   ```
   app.collabwork.com
   ```
3. Update DNS records:
   - Type: CNAME
   - Name: app
   - Value: cname.vercel-dns.com

### API Configuration

The application uses a hardcoded production API endpoint at `https://api.collabwork.com`. No environment-specific configuration is required.

## Deployment Verification

After deployment, verify:

1. **Authentication**
   - [ ] Login page loads
   - [ ] Can authenticate successfully
   - [ ] Session persists across refreshes

2. **Core Features**
   - [ ] Dashboard displays jobs
   - [ ] Filtering works correctly
   - [ ] Job actions complete successfully
   - [ ] Data updates in real-time

3. **Performance**
   - [ ] Page load time < 3 seconds
   - [ ] No console errors
   - [ ] Images load properly

## Production Best Practices

### 1. Security Checklist
- [ ] No sensitive data in code
- [ ] HTTPS enforced
- [ ] CSP headers configured

### 2. Performance Optimization
```json
// next.config.js optimizations
{
  "images": {
    "domains": ["your-cdn.com"]
  },
  "compress": true,
  "poweredByHeader": false
}
```

### 3. Monitoring Setup
- Enable Vercel Analytics
- Set up Web Vitals tracking
- Configure error alerts

## Troubleshooting

### Common Issues

**Build Errors**
```bash
# Clear cache and dependencies
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

**API Connection Failed**
1. Check that api.collabwork.com is accessible
2. Verify CORS settings allow your domain
3. Check network connectivity

### Debug Commands
```bash
# Check build output
npm run build -- --debug

# Analyze bundle size
npm run analyze

# Type checking
npm run type-check
```

## Maintenance

### Regular Tasks
- Monitor error logs weekly
- Update dependencies monthly
- Review performance metrics
- Backup environment configs

### Updating the Application
```bash
# Deploy updates
git push origin main  # If using GitHub integration
# OR
vercel --prod        # If using CLI
```

### Rollback Process
1. Go to Vercel Dashboard
2. Navigate to Deployments
3. Find previous stable deployment
4. Click "..." → "Promote to Production"

## Advanced Configuration

### Edge Functions
```javascript
// middleware.ts for auth
export const config = {
  matcher: ['/dashboard/:path*', '/api/:path*']
}
```

### Caching Strategy
```javascript
// Cache static assets
export const revalidate = 3600 // 1 hour
```

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Xano API Documentation](https://docs.xano.com)
- [Performance Best Practices](https://web.dev/performance)

## Support Contacts

- Technical Issues: tech@collabwork.com
- Deployment Help: devops@collabwork.com
- Xano Support: support@xano.com