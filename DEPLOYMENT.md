# Pure Path - Deployment Checklist

## Pre-Deployment Requirements

### Environment Variables
Add these to your Vercel project (Settings → Environment Variables):

```
DATABASE_URL=postgresql://...  # Your Neon database URL
JWT_SECRET=your-secure-secret-key-here  # Generate a strong random key
MPESA_API_KEY=your-mpesa-api-key
MPESA_CONSUMER_KEY=your-mpesa-consumer-key
MPESA_CONSUMER_SECRET=your-mpesa-consumer-secret
MPESA_SHORT_CODE=your-business-short-code
MPESA_PASSKEY=your-mpesa-passkey
```

### Generate Secure Secrets

```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use OpenSSL
openssl rand -hex 32
```

## Database Setup

### 1. Create Neon Database
- Go to [neon.tech](https://neon.tech)
- Create a new project
- Copy the connection string
- Add to `DATABASE_URL` in environment variables

### 2. Run Migrations
```bash
# Local setup (optional, Vercel will handle this)
npm run db:migrate
```

### 3. Verify Schema
```bash
# Check tables exist
psql $DATABASE_URL -c "\dt"
```

## M-Pesa Configuration

### 1. Get M-Pesa Credentials
- Register at [Safaricom Daraja Portal](https://developer.safaricom.co.ke)
- Create an app
- Get your credentials:
  - Consumer Key
  - Consumer Secret
  - Shortcode (Business Shortcode)
  - Passkey

### 2. Configure Callback URL
In M-Pesa portal, set callback URLs to:
- **Confirmation URL**: `https://yourdomain.com/api/payments/mpesa-callback`
- **Validation URL**: `https://yourdomain.com/api/payments/mpesa-callback`

### 3. Test M-Pesa Integration
- Set up test number: `254728282828` (if available)
- Process a test payment
- Verify callback is received

## Deployment Steps

### Step 1: Prepare Repository (if using GitHub)
```bash
git add .
git commit -m "Deploy Pure Path welfare system"
git push origin main
```

### Step 2: Deploy to Vercel
**Option A: Using Vercel Dashboard**
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Select your GitHub repository
4. Add environment variables
5. Click "Deploy"

**Option B: Using Vercel CLI**
```bash
npm install -g vercel
vercel env pull  # Pull existing env vars
vercel          # Deploy
```

### Step 3: Configure Domain
1. In Vercel dashboard → Project Settings
2. Go to "Domains"
3. Add your custom domain
4. Update DNS records per Vercel instructions
5. Wait for SSL certificate (usually 5-15 minutes)

### Step 4: Test Deployment
```bash
# Visit https://yourdomain.com
# Test login/registration
# Verify database connectivity
# Test PWA installation
```

## Post-Deployment

### 1. Security Checks
- [ ] All environment variables set
- [ ] HTTPS enabled (check green lock)
- [ ] No console errors in browser DevTools
- [ ] Cookies marked as secure
- [ ] CORS properly configured

### 2. PWA Verification
- [ ] Can install on mobile
- [ ] Can install on desktop
- [ ] Works offline
- [ ] Service worker registered
- [ ] Manifest.json accessible

### 3. Mobile Testing
- [ ] Responsive on iPhone
- [ ] Responsive on Android
- [ ] Responsive on iPad
- [ ] Touch gestures work
- [ ] Forms are usable on mobile

### 4. Feature Testing
- [ ] User registration works
- [ ] Login/logout works
- [ ] Dashboard loads
- [ ] Family management works
- [ ] M-Pesa payment flow works
- [ ] Admin dashboard accessible
- [ ] Reports load correctly

### 5. Performance
- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 2s
- [ ] Largest Contentful Paint < 3s
- [ ] Cumulative Layout Shift < 0.1

### 6. Database Backup
```bash
# Create backup
pg_dump $DATABASE_URL > backup.sql

# Restore if needed
psql $DATABASE_URL < backup.sql
```

## Monitoring & Maintenance

### 1. Enable Monitoring
- Set up error tracking (Sentry recommended)
- Enable performance monitoring
- Set up uptime checks

### 2. Regular Updates
- Keep Next.js updated
- Update dependencies monthly
- Apply security patches promptly

### 3. Backup Strategy
- Daily automated database backups
- Keep 7-day backup rotation
- Test backup restoration monthly

### 4. Log Management
- Monitor error logs weekly
- Review performance logs
- Archive old logs

## Scaling Considerations

### Database
- Monitor connection pool usage
- Consider read replicas for high load
- Implement query optimization

### API Limits
- M-Pesa has rate limits (check with Safaricom)
- Implement request throttling
- Cache frequently accessed data

### CDN
- Consider CloudFlare for static assets
- Enable image optimization
- Use edge caching

## Troubleshooting

### Deployment Failed
1. Check build logs in Vercel
2. Verify environment variables
3. Check database connectivity
4. Review error messages
5. Rollback to previous version if needed

### Blank Page
1. Check browser console for errors
2. Verify environment variables
3. Check database connection
4. Review API responses

### Payment Not Working
1. Verify M-Pesa credentials
2. Check callback URL configuration
3. Review M-Pesa status page
4. Check database for payment records

### PWA Not Installing
1. Verify manifest.json accessible
2. Check HTTPS enabled
3. Verify app icons exist
4. Clear browser cache
5. Try different browser/device

## Rollback Procedure

If deployment has critical issues:

```bash
# Using Vercel CLI
vercel rollback

# Or in dashboard:
# Project Settings → Deployments → Find previous → Click "Redeploy"
```

## Monitoring URLs

Add these bookmarks for quick monitoring:

```
https://yourdomain.com/api/health
https://yourdomain.com/admin  
https://yourdomain.com/login
https://yourdomain.com/manifest.json
```

## Emergency Contacts

- **Vercel Support**: [vercel.com/help](https://vercel.com/help)
- **M-Pesa Support**: Safaricom Daraja Portal
- **Neon Support**: [neon.tech/docs](https://neon.tech/docs)

## Checklist Summary

- [ ] All env variables configured
- [ ] Database migrations complete
- [ ] M-Pesa credentials verified
- [ ] Domain configured
- [ ] SSL certificate active
- [ ] PWA tested on mobile
- [ ] All features tested
- [ ] Performance acceptable
- [ ] Monitoring enabled
- [ ] Backups configured
- [ ] Team trained
- [ ] Launch announcement ready

## Success Criteria

Your deployment is successful when:
1. Users can register and login
2. Dashboard loads without errors
3. Family members can be added
4. M-Pesa payments work end-to-end
5. Admin dashboard shows correct data
6. App works offline (cached pages)
7. Can install as app on mobile
8. No console errors
9. Lighthouse score > 90
10. Load time < 3 seconds

---

**Date Deployed**: _________
**Deployed By**: _________
**Notes**: _________
