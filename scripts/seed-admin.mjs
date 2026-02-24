import { hash } from 'bcryptjs';
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seedAdmin() {
  try {
    // Admin credentials
    const adminEmail = 'admin@purepath.local';
    const adminPhone = '+254712345678';
    const adminName = 'Pure Path Admin';
    const adminPassword = 'AdminPassword123!'; // Change this in production

    console.log('[v0] Starting admin seeding...');
    console.log(`[v0] Admin Email: ${adminEmail}`);
    console.log(`[v0] Admin Phone: ${adminPhone}`);

    // Hash the password
    console.log('[v0] Hashing password...');
    const hashedPassword = await hash(adminPassword, 10);

    // Check if admin already exists
    console.log('[v0] Checking if admin exists...');
    const existingAdmin = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [adminEmail]
    );

    if (existingAdmin.rows.length > 0) {
      console.log('[v0] Admin already exists. Skipping seed.');
      return;
    }

    // Insert admin user
    console.log('[v0] Creating admin user...');
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, phone_number, role, status) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, email, full_name, role, status`,
      [adminEmail, hashedPassword, adminName, adminPhone, 'admin', 'active']
    );

    if (result.rows.length > 0) {
      const admin = result.rows[0];
      console.log('[v0] Admin created successfully!');
      console.log('[v0] Admin Details:');
      console.log(`  - ID: ${admin.id}`);
      console.log(`  - Email: ${admin.email}`);
      console.log(`  - Name: ${admin.full_name}`);
      console.log(`  - Role: ${admin.role}`);
      console.log(`  - Status: ${admin.status}`);
      console.log(`[v0] Temporary Password: ${adminPassword}`);
      console.log('[v0] ⚠️  IMPORTANT: Change this password after first login!');
    }
  } catch (error) {
    console.error('[v0] Error seeding admin:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedAdmin();
