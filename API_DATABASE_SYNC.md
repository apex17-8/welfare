# API & Database Synchronization Guide

## Overview

This document ensures all APIs, database schema, and frontend forms are perfectly synchronized to prevent data insertion errors during registration, password reset, and other critical operations.

## Users Table Schema

### Database Schema (after migration)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  role VARCHAR(50) DEFAULT 'member',
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Field Mapping

| Database Column | Frontend Form | API Request | API Response | Type | Required | Format |
|---|---|---|---|---|---|---|
| `id` | (auto-generated) | (auto-generated) | ✓ | UUID | Yes | uuid |
| `email` | email input | email | ✓ | string | Yes | email format |
| `password_hash` | password input | password | ✗ | hashed | Yes | 8+ chars |
| `full_name` | fullName input | fullName | ✓ as fullName | string | Yes | any |
| `phone_number` | phoneNumber input | phoneNumber | ✓ as phoneNumber | string | Yes | +254XXXXXXXXX or 0XXXXXXXXX |
| `role` | (default) | role | ✓ | string | Yes | 'member' \| 'admin' |
| `status` | (auto) | (auto) | ✓ | string | Yes | 'pending' \| 'active' \| 'rejected' |
| `created_at` | (auto) | (auto) | ✓ | timestamp | - | ISO 8601 |
| `updated_at` | (auto) | (auto) | ✓ | timestamp | - | ISO 8601 |

## API Routes

### 1. Registration API
**Endpoint:** `POST /api/auth/register`

**Request Body (Frontend → API):**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "fullName": "John Doe",
  "phoneNumber": "+254712345678",
  "role": "member"
}
```

**Validations:**
- Email: Required, valid email format, unique in DB
- Password: Required, minimum 8 characters
- fullName: Required, any string
- phoneNumber: Required, format +254XXXXXXXXX or 0XXXXXXXXX
- role: Optional, defaults to 'member'

**Database Insert:**
```sql
INSERT INTO users (email, password_hash, full_name, phone_number, role, status)
VALUES ($1, $2, $3, $4, $5, 'pending');
```

**Response (API → Frontend):**
```json
{
  "success": true,
  "user": {
    "id": "uuid-string",
    "email": "user@example.com",
    "fullName": "John Doe",
    "phoneNumber": "+254712345678",
    "role": "member"
  }
}
```

### 2. Login API
**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Database Query:**
```sql
SELECT id, email, password_hash, full_name, phone_number, role, status
FROM users WHERE email = $1;
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid-string",
    "email": "user@example.com",
    "fullName": "John Doe",
    "phoneNumber": "+254712345678",
    "role": "member",
    "status": "active"
  }
}
```

### 3. Forgot Password API
**Endpoint:** `POST /api/auth/forgot-password`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Database Operations:**
1. Query users table by email
2. If exists, insert reset token into `password_reset_tokens` table
3. Return success (never reveal if email exists for security)

**Response:**
```json
{
  "success": true,
  "message": "If email exists, a reset link will be sent",
  "resetLink": "http://localhost:3000/reset-password?token=...&email=..."
}
```

### 4. Reset Password API
**Endpoint:** `POST /api/auth/reset-password`

**Request Body:**
```json
{
  "token": "reset-token-string",
  "email": "user@example.com",
  "newPassword": "NewSecurePassword123",
  "confirmPassword": "NewSecurePassword123"
}
```

**Database Operations:**
1. Hash token with SHA256
2. Query `password_reset_tokens` by token_hash and email
3. Verify token is not expired (15 minutes)
4. Update user password_hash and set status to 'active'
5. Delete used token

**Response:**
```json
{
  "success": true,
  "message": "Password has been reset successfully"
}
```

## Password Reset Tokens Table

### Schema
```sql
CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Token Flow:**
1. Frontend: User enters email
2. API: Generate random 32-byte token → Hash with SHA256
3. Database: Store token_hash (never store plain token)
4. Response: Send plain token to user (development) or via email
5. Reset: User sends plain token → API hashes and compares with stored hash

## Common Issues & Prevention

### Issue: "column 'fullName' does not exist"
**Cause:** API sends `fullName` but database expects `full_name`
**Solution:** Always use `full_name` in database, convert in API response to `fullName`

### Issue: "null value in column 'phone_number' violates not-null constraint"
**Cause:** Phone number not collected in registration form
**Solution:** Add phone number input field and collect before API call

### Issue: "duplicate key value violates unique constraint 'users_email_key'"
**Cause:** Email already exists in database
**Solution:** Check for existing email before insertion, return 409 Conflict

### Issue: Database queries fail after schema changes
**Cause:** Migration scripts not executed
**Solution:** Always execute migration scripts first before deploying API changes

## Sync Checklist

### Adding New User Field

1. **Database:** Add column to `users` table migration
2. **API:** Add field to registration POST request validation
3. **Frontend:** Add input field to registration form
4. **API Response:** Include field in response mapping
5. **Tests:** Verify field is inserted and retrieved correctly

### Example: Adding Username
```
1. Migration:
   ALTER TABLE users ADD COLUMN username VARCHAR(255) NOT NULL UNIQUE;

2. API Registration:
   - Add to validation: if (!username) return error
   - Add to insert: ..., $5, $6 for username
   - Add to response: username: user.username

3. Frontend:
   - Add input: <Input value={username} onChange={...} />
   - Add to request: { ..., username }

4. Test:
   - Try registration with username
   - Verify in database
   - Verify in response
```

## Testing Checklist

Before deploying, verify:

- [ ] Registration with valid data → Success
- [ ] Registration with duplicate email → 409 error
- [ ] Registration with invalid phone → 400 error
- [ ] Registration with short password → 400 error
- [ ] Login with correct credentials → Success
- [ ] Login with wrong password → 401 error
- [ ] Forgot password with existing email → Success
- [ ] Reset password with valid token → Success
- [ ] Reset password with expired token → 400 error
- [ ] Reset password with invalid token → 400 error
- [ ] Phone number required in registration → Field appears in form

## Environment Variables

Required for authentication:
```
DATABASE_URL=postgresql://user:password@host/database
JWT_SECRET=your-secret-key-min-32-chars
NEXT_PUBLIC_BASE_URL=http://localhost:3000 (or your domain)
NODE_ENV=development|production
```

## Migration Order

Always run in this order:

1. `scripts/create-welfare-schema.sql` - Initial schema
2. `scripts/fix-schema-and-add-password-reset.sql` - Fix columns + password reset
3. Start application server
4. Deploy frontend code

## API Response Field Naming

All API responses convert snake_case database columns to camelCase:

```
Database → API Response
email → email
full_name → fullName
phone_number → phoneNumber
password_hash → (never exposed)
created_at → createdAt
updated_at → updatedAt
```
