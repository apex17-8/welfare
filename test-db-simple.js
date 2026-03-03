// test-db-simple.js
const { Pool } = require('pg');

// Use the same connection string from your .env
const connectionString = 'postgresql://neondb_owner:npg_M8S9yNzjpBiV@ep-square-tooth-aif9ak5k-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 5000
});

async function test() {
  console.log('Testing database connection...');
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('✅ Connection successful!');
    console.log('Server time:', res.rows[0].now);
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  } finally {
    await pool.end();
  }
}

test();