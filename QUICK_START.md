# Pure Path - Quick Start (5 Minutes)

Get your Pure Path welfare system running in just 5 minutes!

## Step 1: Clone & Install (1 minute)

```bash
# If you have the code locally
cd pure-path
npm install

# Or create new project
npx create-next-app@latest my-welfare-app --typescript
# Then copy files from this repository
```

## Step 2: Environment Variables (2 minutes)

Create `.env.local` in your project root:

```env
# Database - Get from Neon
DATABASE_URL=postgresql://user:password@db.neon.tech/your_database

# JWT Secret - Generate this:
# Run: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your-generated-secret-here

# M-Pesa (from Safaricom Daraja) - Optional for testing
MPESA_API_KEY=your-api-key
MPESA_CONSUMER_KEY=your-consumer-key
MPESA_CONSUMER_SECRET=your-consumer-secret
MPESA_SHORT_CODE=your-shortcode
MPESA_PASSKEY=your-passkey
```

## Step 3: Start Development (1 minute)

```bash
npm run dev
```

Open `http://localhost:3000` in your browser.

## Step 4: Test It Out (1 minute)

1. **Register** → Click "Sign up" on login page
2. **Create Account** → Fill in email, password, name
3. **Login** → Use your credentials
4. **See Dashboard** → You're in! 🎉

---

## 🎯 What You Can Do Right Now

### As a Member
- ✅ Register and login
- ✅ Add family members
- ✅ View dashboard
- ✅ Try payment form (won't charge without M-Pesa setup)

### As an Admin (Set role to 'admin' in database)
- ✅ View admin dashboard
- ✅ See member list
- ✅ Check analytics

### Mobile Testing
- ✅ Open in mobile browser
- ✅ Test responsive design
- ✅ Try "install app" on Android
- ✅ Try "add to home screen" on iOS

---

## 🚀 Deploy to Vercel (5 minutes extra)

### Option 1: Using GitHub (Easiest)

1. Push code to GitHub:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Select your GitHub repo
5. Add environment variables
6. Click Deploy ✅

### Option 2: Deploy from Local

```bash
npm install -g vercel
vercel env pull  # Download existing vars (if any)
vercel          # Deploy
```

---

## 📱 Install on Your Phone

### Android (Chrome)
1. Open your deployed site
2. See "Install Pure Path" prompt
3. Tap Install → Done! 📱

### iOS (Safari)
1. Open your deployed site in Safari
2. Tap Share button
3. Tap "Add to Home Screen"
4. Tap "Add" → Done! 📱

---

## 🔧 Configure M-Pesa (Optional)

**Skip this if just testing!**

1. Go to [developer.safaricom.co.ke](https://developer.safaricom.co.ke)
2. Sign up / Login
3. Create an app
4. Copy credentials
5. Paste into `.env.local`
6. Test a payment

---

## 📊 Database Setup

The database schema is automatically created when you deploy. For local testing, you can create tables with:

```bash
# Make sure DATABASE_URL is set
psql $DATABASE_URL < scripts/create-welfare-schema.sql
```

---

## 🧪 Test the System

### Test Login
- Email: `test@example.com`
- Password: `test123`
- (Create this account first via registration)

### Test Payment (with M-Pesa)
1. Go to Dashboard → Pay
2. Amount: 100
3. Phone: Your M-Pesa number
4. Click "Proceed"
5. Confirm on phone

### Test Admin
1. Go to `/admin`
2. You'll see admin dashboard if logged in as admin
3. (Set your user role to 'admin' in database to test)

---

## ❌ Troubleshooting

### "Database connection error"
```
✅ Check DATABASE_URL in .env.local
✅ Verify Neon database is running
✅ Try: psql $DATABASE_URL -c "SELECT 1"
```

### "Login not working"
```
✅ Check JWT_SECRET is set
✅ Clear browser cookies
✅ Try incognito/private mode
✅ Check database tables exist
```

### "M-Pesa payment stuck"
```
✅ Use test number if available
✅ Check phone number format (254... or 07...)
✅ Check MPESA_CONSUMER_KEY is correct
✅ Check callback URL is configured
```

### "App won't install on mobile"
```
✅ Clear browser cache
✅ Make sure you're on HTTPS
✅ Try different browser
✅ Check manifest.json is accessible
```

---

## 📚 Documentation

Read these in order:

1. **README.md** - Overview and features
2. **SETUP.md** - Detailed system guide
3. **MOBILE_PWA_SETUP.md** - Mobile app setup
4. **DEPLOYMENT.md** - Production checklist

For now, you can skip these and come back later:
- MOBILE_FEATURES.md
- IMPLEMENTATION_COMPLETE.md
- QUICK_START.md (this file)

---

## 🎓 Learn More

### Next.js
- [nextjs.org](https://nextjs.org)
- [API Routes](https://nextjs.org/docs/api-routes/introduction)

### Database
- [Neon](https://neon.tech) - PostgreSQL database
- [SQL Docs](https://www.postgresql.org/docs/)

### M-Pesa
- [Safaricom Daraja](https://developer.safaricom.co.ke)
- [API Documentation](https://developer.safaricom.co.ke/APIs)

### Deployment
- [Vercel](https://vercel.com) - Deploy Next.js apps
- [Deployment Docs](https://vercel.com/docs)

---

## ✅ Success Checklist

- [ ] Code cloned/copied
- [ ] Node modules installed (`npm install`)
- [ ] `.env.local` created with DATABASE_URL
- [ ] Dev server running (`npm run dev`)
- [ ] Can register account
- [ ] Can login
- [ ] Dashboard visible
- [ ] Can add family member
- [ ] Can open payment form
- [ ] Mobile view is responsive
- [ ] Can install on mobile (optional)

---

## 🎉 Congratulations!

You now have a fully functional welfare management system!

### What's Working
- ✅ User authentication
- ✅ Member management
- ✅ Family tracking
- ✅ Dashboard
- ✅ Admin controls
- ✅ Mobile app features
- ✅ Payment forms (ready for M-Pesa)

### What's Next
1. Customize branding (logo, colors)
2. Configure M-Pesa properly
3. Test with real data
4. Deploy to Vercel
5. Share with your community
6. Start managing welfare!

---

## 🆘 Need Help?

1. **Check Documentation** - README.md and SETUP.md
2. **Check This File** - Troubleshooting section above
3. **Check Logs** - Terminal output and browser console
4. **Read Error Messages** - They're usually helpful!

---

## 🚀 Ready to Deploy?

When you're ready to go live:

1. Read [DEPLOYMENT.md](./DEPLOYMENT.md)
2. Follow the deployment checklist
3. Test everything on live site
4. Monitor for errors
5. Celebrate! 🎉

---

## 📞 Contact

- **Questions?** Check the markdown files
- **M-Pesa Help?** Go to Safaricom Daraja
- **Deployment Help?** Go to Vercel
- **Code Issues?** Check the code comments

---

**Pure Path - Welfare Management Made Simple**

Start using it now, customize later. You're all set! 🚀
