// test-wake-up.js
const { Client } = require('pg');

const config = {
  host: 'ep-square-tooth-aif9ak5k-pooler.c-4.us-east-1.aws.neon.tech',
  port: 5432,
  database: 'neondb',
  user: 'neondb_owner',
  password: 'npg_M8S9yNzjpBiV',
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 30000, // Longer timeout for waking up
};

console.log('🔍 Attempting to wake up the database...');
console.log('This might take up to 30 seconds if the database is sleeping');

const client = new Client(config);

async function test() {
  try {
    console.log('🔄 Connecting (this may take a moment)...');
    await client.connect();
    console.log('✅ Database woke up and connected!');
    
    const res = await client.query('SELECT NOW()');
    console.log('Server time:', res.rows[0].now);
    
    await client.end();
  } catch (err) {
    console.error('\n❌ Failed:', err.message);
  }
}

test();