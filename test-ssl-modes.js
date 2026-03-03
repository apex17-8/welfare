// test-ssl-modes.js
const { Pool } = require('pg');

const baseConnectionString = 'postgresql://neondb_owner:npg_M8S9yNzjpBiV@ep-square-tooth-aif9ak5k-pooler.c-4.us-east-1.aws.neon.tech/neondb';

async function testSSLMode(mode, sslConfig) {
  console.log(`\n🔍 Testing SSL mode: ${mode}`);
  
  const connectionString = `${baseConnectionString}?sslmode=${mode}`;
  console.log('Connection string (masked):', connectionString.replace(/:[^:@]*@/, ':***@'));
  
  const pool = new Pool({
    connectionString,
    ssl: sslConfig,
    connectionTimeoutMillis: 10000,
  });

  try {
    console.log('Connecting...');
    const client = await pool.connect();
    console.log('✅ Connected successfully!');
    
    const res = await client.query('SELECT NOW()');
    console.log('   Server time:', res.rows[0].now);
    
    client.release();
    await pool.end();
    return true;
  } catch (err) {
    console.log('❌ Failed:', err.message);
    return false;
  }
}

async function runTests() {
  console.log('🔬 TESTING DIFFERENT SSL CONFIGURATIONS');
  console.log('='.repeat(50));

  // Test different SSL modes
  const tests = [
    { mode: 'require', ssl: { rejectUnauthorized: false } },
    { mode: 'require', ssl: { rejectUnauthorized: true } },
    { mode: 'verify-ca', ssl: { rejectUnauthorized: true } },
    { mode: 'verify-full', ssl: { rejectUnauthorized: true } },
    { mode: 'prefer', ssl: { rejectUnauthorized: false } },
    { mode: 'disable', ssl: false },
  ];

  for (const test of tests) {
    await testSSLMode(test.mode, test.ssl);
  }
}

runTests();