# Pure Path - Welfare Management System Setup Guide

## Project Overview

Pure Path is a comprehensive Community Welfare Management System built with Next.js 16, featuring member management, contribution tracking, M-Pesa payment integration, and admin analytics.

**NOW WITH MOBILE APP AND PWA SUPPORT!** 📱
- Fully responsive design for mobile, tablet, and desktop
- Installable as a native app on iOS, Android, and desktop
- Works offline with service worker caching
- Progressive Web App (PWA) capabilities
- Touch-optimized UI with mobile-friendly navigation

See [MOBILE_PWA_SETUP.md](./MOBILE_PWA_SETUP.md) for detailed mobile and PWA setup instructions.

## Completed Features

### 1. Database & Infrastructure
- ✅ Neon PostgreSQL database with complete schema
- ✅ Tables: users, family_members, contributions, payments, approval_logs, audit_logs
- ✅ Proper indexes and relationships configured

### 2. Authentication System
- ✅ Secure user registration and login
- ✅ JWT-based session management with HTTP-only cookies
- ✅ Password hashing with bcryptjs
- ✅ Role-based access control (admin/member)
- ✅ Protected routes with middleware

**Routes:**
- `/login` - User login
- `/register` - New user registration
- `/api/auth/login` - Login API
- `/api/auth/register` - Registration API
- `/api/auth/logout` - Logout API
- `/api/auth/me` - Get current user

### 3. Member Dashboard
- ✅ Personal dashboard with quick actions
- ✅ Family member management (add/view members)
- ✅ Contribution tracking with history
- ✅ M-Pesa payment integration
- ✅ Real-time statistics

**Member Routes:**
- `/dashboard` - Main dashboard
- `/dashboard/family` - Manage family members
- `/dashboard/contributions` - View/add contributions
- `/dashboard/pay` - Make payments via M-Pesa

### 4. Admin Dashboard
- ✅ System overview with key metrics
- ✅ Member approval workflow
- ✅ Payment management and tracking
- ✅ Advanced analytics and reports
- ✅ Top contributors ranking
- ✅ Real-time payment status tracking

**Admin Routes:**
- `/admin` - Admin dashboard
- `/admin/members` - Member management & approval
- `/admin/payments` - Payment tracking
- `/admin/reports` - Analytics & reports

### 5. M-Pesa Payment Integration
- ✅ STK Push implementation for payment prompts
- ✅ Payment callback handling
- ✅ Transaction verification
- ✅ Receipt storage and audit logs
- ✅ Automatic contribution recording on successful payment

**Payment Flow:**
1. User initiates payment via `/dashboard/pay`
2. System calls M-Pesa STK Push API
3. M-Pesa prompt appears on user's phone
4. User enters M-Pesa PIN
5. M-Pesa sends callback to `/api/payments/mpesa-callback`
6. System updates payment status and creates contribution record

## Environment Variables Required

```
# Database
DATABASE_URL=your_neon_postgresql_url

# JWT
JWT_SECRET=your_jwt_secret_key_here

# M-Pesa Configuration
MPESA_SHORTCODE=174379
MPESA_CONSUMER_KEY=your_m_pesa_consumer_key
MPESA_CONSUMER_SECRET=your_m_pesa_consumer_secret
MPESA_PASSKEY=your_m_pesa_passkey

# App URL (for M-Pesa callbacks)
NEXT_PUBLIC_APP_URL=https://your-app-url.com
```

## Installation & Running

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables:
   - Add the required environment variables above to your Vercel project Vars section

3. The database schema is already created (scripts/create-welfare-schema.sql)

4. Run the development server:
```bash
pnpm dev
```

5. Open http://localhost:3000 in your browser

## Default Admin Setup

To create an admin user, you can modify the registration to include:
```javascript
role: 'admin' // instead of 'member'
```

Or manually insert in the database:
```sql
INSERT INTO users (email, password_hash, full_name, role, status)
VALUES ('admin@purepa th.com', '$2a$10$...', 'Admin User', 'admin', 'active');
```

## Project Structure

```
app/
├── api/
│   ├── auth/              # Authentication endpoints
│   ├── admin/             # Admin APIs
│   ├── members/           # Member APIs
│   └── payments/          # Payment APIs
├── login/                 # Login page
├── register/              # Registration page
├── dashboard/             # Member dashboard
│   ├── family/           # Family management
│   ├── contributions/    # Contributions
│   └── pay/              # Payment page
├── admin/                 # Admin dashboard
│   ├── members/          # Member management
│   ├── payments/         # Payment tracking
│   └── reports/          # Analytics
└── layout.tsx

lib/
├── auth.ts               # Authentication utilities
├── db.ts                 # Database utilities
├── session.ts            # Session management
└── mpesa.ts              # M-Pesa integration

scripts/
└── create-welfare-schema.sql  # Database schema
```

## Key Features

### Security
- HTTP-only cookies for session storage
- Password hashing with bcryptjs
- JWT token validation
- Role-based route protection
- CSRF protection ready
- SQL injection prevention via parameterized queries

### User Experience
- Responsive design with Tailwind CSS
- Dark theme optimized for readability
- Real-time form validation
- Clear error messages
- Loading states and feedback

### Data Management
- Audit logging for all transactions
- Approval workflow for new members
- Payment receipt storage
- Contribution history tracking
- Top contributor rankings

## M-Pesa Integration Details

The system uses Daraja API (M-Pesa Developer Portal) for:
- Authentication via OAuth 2.0
- STK Push for payment prompts
- Transaction status queries
- Callback webhook for payment confirmation

M-Pesa credentials should be obtained from:
https://developer.safaricom.co.ke

## Testing

### Test Admin Login
- Email: admin@purepath.com
- Password: (set your own)

### Test Member Flow
1. Register at `/register`
2. Login at `/login`
3. View dashboard at `/dashboard`
4. Add family members at `/dashboard/family`
5. Add contributions at `/dashboard/contributions`
6. Make payment at `/dashboard/pay`

### Admin Testing
- Login with admin account
- Approve pending members at `/admin/members`
- View analytics at `/admin/reports`
- Track payments at `/admin/payments`

## Future Enhancements

- SMS notifications for payment status
- WhatsApp integration for announcements
- PDF report generation
- Email receipt delivery
- Mobile app version
- Advanced analytics dashboard
- Member communication platform
- Beneficiary distribution system

## Support & Maintenance

- Monitor audit logs regularly
- Review pending approvals weekly
- Check payment success rates
- Update M-Pesa credentials as needed
- Backup database regularly
- Monitor system performance

## License

This project is proprietary and intended for community welfare management.
