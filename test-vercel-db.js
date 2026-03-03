// test-vercel-db.js
require('dotenv').config({ path: '.env' });
const { Pool } = require('pg');

console.log('🔍 TESTING WITH ENVIRONMENT VARIABLES');
console.log('='.repeat(50));

// Check all possible Vercel Postgres env vars
const possibleEnvVars = [
  'DATABASE_URL',
  'POSTGRES_URL',
  'POSTGRES_URL_NON_POOLING',
  'POSTGRES_PRISMA_URL'
];

let foundConnection = false;

possibleEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName} found`);
    console.log(`   (masked): ${value.replace(/:[^:@]*@/, ':***@')}`);
    foundConnection = true;
  } else {
    console.log(`❌ ${varName} not found`);
  }
});

if (!foundConnection) {
  console.log('\n⚠️ No database environment variables found!');
  console.log('Please check your .env file and make sure it contains:');
  console.log('DATABASE_URL=postgresql://...');
  process.exit(1);
}

// Test the first available connection
async function testConnection() {
  const connectionString = process.env.DATABASE_URL || 
                          process.env.POSTGRES_URL || 
                          process.env.POSTGRES_URL_NON_POOLING;

  if (!connectionString) {
    console.log('\n❌ No connection string available to test');
    return;
  }

  console.log('\n📡 Testing connection with:', connectionString.replace(/:[^:@]*@/, ':***@'));

  const pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    },
    connectionTimeoutMillis: 10000,
  });

  try {
    console.log('Connecting...');
    const client = await pool.connect();
    console.log('✅ Connected to database!');
    
    const res = await client.query('SELECT version(), current_database()');
    console.log('\n📊 Database info:');
    console.log(`   Version: ${res.rows[0].version}`);
    console.log(`   Database: ${res.rows[0].current_database}`);
    
    // Check if users table exists
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('\n📋 Tables found:');
    if (tables.rows.length > 0) {
      tables.rows.forEach(row => console.log(`   - ${row.table_name}`));
    } else {
      console.log('   No tables found');
    }
    
    client.release();
    await pool.end();
    console.log('\n✅ Test complete!');
    
  } catch (err) {
    console.error('\n❌ Connection failed:', err.message);
    if (err.code) console.error('   Code:', err.code);
  }
}

testConnection();