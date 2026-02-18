# Pure Path - Community Welfare Management System

Welcome to **Pure Path**, a modern, mobile-first web application for managing community welfare contributions and member support.

![Status](https://img.shields.io/badge/status-production--ready-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Mobile](https://img.shields.io/badge/mobile-PWA%20%26%20responsive-orange)

## 🎯 What is Pure Path?

Pure Path is a comprehensive system designed to help community groups (churches, organizations, mutual aid societies) manage:
- **Member Management** - Register, approve, and manage community members
- **Family Records** - Track family member information
- **Contributions** - Record and track member contributions
- **Payments** - M-Pesa integration for seamless payments
- **Analytics** - Detailed reports and payment tracking
- **Admin Controls** - Powerful administration dashboard

## ✨ Key Features

### 🔐 Secure Authentication
- User registration and secure login
- JWT-based session management
- Role-based access control (Members & Admins)
- Password encryption with bcryptjs

### 👥 Member Management
- Member registration with approval workflow
- Family member tracking
- Contribution history
- Member status dashboard

### 💳 Payment System
- M-Pesa STK push for seamless payments
- Real-time payment confirmation
- Payment history and receipts
- Transaction tracking

### 📊 Analytics & Reporting
- Dashboard with key metrics
- Contribution trends (monthly charts)
- Payment status distribution
- Top contributors ranking
- Member statistics

### 📱 Mobile & PWA
- **Fully responsive** design (320px - 4K)
- **Installable as app** on iOS, Android, and desktop
- **Works offline** with service worker caching
- **Touch-optimized** navigation and forms
- **Progressive enhancement** for all devices

### 🚀 Performance
- Fast initial load (~2-3 seconds)
- Cached repeat loads (~500ms)
- Instant offline access
- Optimized images and assets

## 🛠️ Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui
- **Database**: PostgreSQL (Neon)
- **Auth**: JWT + HTTP-only cookies
- **Payment**: M-Pesa (Safaricom)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Deployment**: Vercel

## 📦 Project Structure

```
pure-path/
├── app/                          # Next.js app directory
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── admin/                # Admin endpoints
│   │   ├── members/              # Member endpoints
│   │   └── payments/             # Payment endpoints
│   ├── login/                    # Login page
│   ├── register/                 # Registration page
│   ├── dashboard/                # Member dashboard
│   │   ├── page.tsx
│   │   ├── family/
│   │   ├── contributions/
│   │   └── pay/
│   ├── admin/                    # Admin dashboard
│   │   ├── page.tsx
│   │   ├── members/
│   │   ├── payments/
│   │   └── reports/
│   ├── layout.tsx                # Root layout with PWA
│   └── globals.css               # Global styles
│
├── components/
│   ├── mobile-nav.tsx            # Responsive navigation
│   ├── pwa-provider.tsx          # PWA install prompts
│   └── ui/                       # shadcn/ui components
│
├── lib/
│   ├── auth.ts                   # Auth utilities
│   ├── db.ts                     # Database utilities
│   ├── session.ts                # Session management
│   └── mpesa.ts                  # M-Pesa utilities
│
├── public/
│   ├── manifest.json             # PWA configuration
│   ├── sw.js                     # Service worker
│   ├── offline.html              # Offline page
│   └── icons/                    # App icons
│
├── scripts/
│   └── create-welfare-schema.sql # Database schema
│
├── SETUP.md                      # Setup guide
├── MOBILE_PWA_SETUP.md          # Mobile & PWA guide
├── MOBILE_FEATURES.md            # Feature overview
└── DEPLOYMENT.md                 # Deployment checklist
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/pnpm
- Neon PostgreSQL account
- M-Pesa developer account (for payments)

### Local Development

1. **Clone and Install**
```bash
git clone <repository-url>
cd pure-path
npm install  # or pnpm install
```

2. **Configure Environment**
Create `.env.local`:
```
DATABASE_URL=postgresql://user:password@db.neon.tech/database
JWT_SECRET=your-secure-secret-key
MPESA_API_KEY=your-mpesa-key
MPESA_CONSUMER_KEY=your-consumer-key
MPESA_CONSUMER_SECRET=your-consumer-secret
```

3. **Setup Database**
```bash
# The schema is already created, but you can reset with:
# psql $DATABASE_URL < scripts/create-welfare-schema.sql
```

4. **Run Development Server**
```bash
npm run dev
```

Visit `http://localhost:3000` to see your app!

5. **Test Login**
- Register a new account at `/register`
- Login at `/login`
- Access dashboard at `/dashboard`

## 🌐 Deployment

### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Then redeploy
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

### Custom Domain
1. Add domain in Vercel project settings
2. Update DNS records
3. Wait for SSL certificate (5-15 minutes)

## 📱 Mobile & PWA

### Install on Mobile

**iOS/iPad (Safari)**
1. Tap Share → Add to Home Screen
2. Name and confirm

**Android (Chrome)**
1. Tap "Install Pure Path" when prompted
2. Or Menu → Install app

**Desktop (Chrome/Edge)**
1. Click install icon in address bar
2. Confirm installation

See [MOBILE_PWA_SETUP.md](./MOBILE_PWA_SETUP.md) for complete guide.

## 💳 M-Pesa Integration

### Setup Steps

1. **Register at Safaricom Daraja**
   - Go to [developer.safaricom.co.ke](https://developer.safaricom.co.ke)
   - Create an app
   - Get credentials

2. **Configure Callback URL**
   - Set to: `https://yourdomain.com/api/payments/mpesa-callback`

3. **Add Credentials to Environment**
   ```
   MPESA_API_KEY=...
   MPESA_CONSUMER_KEY=...
   MPESA_CONSUMER_SECRET=...
   ```

4. **Test Payment Flow**
   - Login as member
   - Go to `/dashboard/pay`
   - Enter amount and M-Pesa number
   - Confirm STK prompt

## 👥 User Roles

### Member
- View personal dashboard
- Manage family members
- Track contributions
- Make payments via M-Pesa
- View payment history

### Admin
- Approve pending members
- Manage all members
- Track all payments
- View detailed analytics
- Generate reports
- System statistics

## 📊 Database Schema

Key tables:
- `users` - Member accounts
- `family_members` - Family information
- `contributions` - Contribution records
- `payments` - Payment transactions
- `approval_logs` - Member approvals
- `audit_logs` - System activity

See [SETUP.md](./SETUP.md) for complete schema.

## 🔒 Security

- ✅ HTTPS encryption (on Vercel)
- ✅ Secure session management
- ✅ Password hashing (bcryptjs)
- ✅ SQL injection prevention (parameterized queries)
- ✅ CORS protection
- ✅ Rate limiting ready
- ✅ No sensitive data offline

## 🎨 Customization

### Branding
- Update app name in `app/layout.tsx`
- Update colors in `app/globals.css`
- Update logo in `public/` directory

### Features
- Add new pages in `app/` directory
- Add API routes in `app/api/` directory
- Modify dashboard sections in components
- Update payment amount limits in `/lib/mpesa.ts`

## 📈 Performance

| Metric | Target | Status |
|--------|--------|--------|
| First Contentful Paint | < 2s | ✅ |
| Largest Contentful Paint | < 3s | ✅ |
| Cumulative Layout Shift | < 0.1 | ✅ |
| Lighthouse Score | > 90 | ✅ |

## 🐛 Troubleshooting

### Database Connection Error
- Check `DATABASE_URL` in env variables
- Verify Neon database is running
- Check network/firewall

### M-Pesa Payment Failed
- Verify consumer credentials
- Check callback URL configuration
- Ensure test number has balance
- Check M-Pesa status page

### App Not Installing on Mobile
- Clear browser cache
- Try different browser
- Update OS/browser
- Check manifest.json is accessible

See [MOBILE_PWA_SETUP.md](./MOBILE_PWA_SETUP.md) for more troubleshooting.

## 🚢 Production Checklist

- [ ] All environment variables configured
- [ ] Database backups automated
- [ ] M-Pesa production credentials in place
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Monitoring enabled
- [ ] Error tracking setup
- [ ] Support email configured
- [ ] Users documentation ready
- [ ] Admin training complete

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete checklist.

## 📞 Support

- **Documentation**: See `*.md` files in project
- **M-Pesa Help**: [Safaricom Daraja Portal](https://developer.safaricom.co.ke)
- **Deployment Issues**: [Vercel Support](https://vercel.com/help)
- **Database Issues**: [Neon Documentation](https://neon.tech/docs)

## 📄 Documentation

- **[SETUP.md](./SETUP.md)** - Detailed system setup
- **[MOBILE_PWA_SETUP.md](./MOBILE_PWA_SETUP.md)** - Mobile app guide
- **[MOBILE_FEATURES.md](./MOBILE_FEATURES.md)** - Feature overview
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment guide

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

---

**Built with ❤️ for community welfare**

Pure Path - Bringing communities together, one contribution at a time.
