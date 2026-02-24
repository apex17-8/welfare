# Admin Seeding Implementation Summary

## What Was Created

### Files Added

1. **`scripts/seed-admin.mjs`** (66 lines)
   - Node.js script to seed initial admin user
   - Uses bcryptjs to hash password (same as registration API)
   - Connects to Neon PostgreSQL via DATABASE_URL
   - Checks if admin exists before creating (idempotent)
   - Displays admin details after creation

2. **`SEEDING_GUIDE.md`** (258 lines)
   - Complete seeding documentation
   - How to run locally and in production
   - Customization options
   - Troubleshooting guide
   - Automation examples (GitHub Actions, Vercel)

### Files Modified

1. **`package.json`**
   - Added npm script: `"seed:admin": "node scripts/seed-admin.mjs"`

## Default Admin Credentials

```
Email:              admin@purepath.local
Phone:              +254712345678
Name:               Pure Path Admin
Role:               admin
Status:             active
Temporary Password: AdminPassword123!
```

**⚠️ IMPORTANT:** Change password after first login!

## How to Use

### Step 1: Run the Seed Script

```bash
npm run seed:admin
```

### Step 2: Login to Admin Dashboard

1. Go to `/login`
2. Use `admin@purepath.local` and `AdminPassword123!`
3. Click "Admin Dashboard" to access

### Step 3: Change Password

1. Go to profile/settings
2. Change password to something secure
3. Never use default password in production

## Features

✅ **Automatic** - One command to set up admin
✅ **Safe** - Checks if admin exists before creating
✅ **Secure** - Uses bcryptjs hashing (same as registration)
✅ **Idempotent** - Can run multiple times safely
✅ **Customizable** - Edit script or use env vars
✅ **Production-Ready** - Works in CI/CD pipelines

## What the Script Does

1. Checks if admin already exists in database
2. If exists: Skips creation (idempotent)
3. If not exists:
   - Hashes password with bcryptjs (cost 10)
   - Creates admin user with role='admin' and status='active'
   - Displays confirmation with admin details
   - Logs temporary password (must change!)

## Database Integration

The script:
- Uses `@neondatabase/serverless` Pool
- Reads DATABASE_URL from environment
- Inserts into `users` table with fields:
  - email
  - password_hash (bcryptjs hashed)
  - full_name
  - phone_number
  - role = 'admin'
  - status = 'active'

## Security Notes

- Password hashed using bcryptjs (rounds: 10)
- Same hashing as registration API
- Never stores plain text passwords
- Temporary password must be changed immediately
- Can be customized via environment variables
- Can be removed and re-seeded if needed

## Usage in Different Environments

### Local Development
```bash
npm run seed:admin
```

### Vercel Deployment
```bash
# In vercel.json or after deployment
npm run seed:admin
```

### GitHub Actions CI/CD
```yaml
- name: Seed Admin
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
  run: npm run seed:admin
```

## After Seeding

Your system is ready to use:
1. Admin account created ✓
2. Can manage members ✓
3. Can approve registrations ✓
4. Can view analytics ✓
5. Can configure payments ✓

## Files Structure

```
Pure Path/
├── scripts/
│   ├── create-welfare-schema.sql      (Initial database schema)
│   ├── fix-schema-and-add-password-reset.sql
│   └── seed-admin.mjs                 ← NEW (Admin seeding)
├── package.json                       (Updated with seed:admin script)
└── SEEDING_GUIDE.md                   ← NEW (Full documentation)
```

## Next Steps

1. Deploy database schema (already done)
2. Run: `npm run seed:admin`
3. Login with admin credentials
4. Change password
5. Approve members
6. Start using the system!
