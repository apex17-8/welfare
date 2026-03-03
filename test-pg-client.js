// test-pg-client.js
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
  connectionTimeoutMillis: 10000,
};

console.log('🔍 Testing PostgreSQL connection with detailed logging');
console.log('Configuration:', {
  ...config,
  password: '***'
});

const client = new Client(config);

client.on('error', (err) => {
  console.error('Client error:', err.message);
});

async function test() {
  try {
    console.log('\n🔄 Connecting...');
    await client.connect();
    console.log('✅ Connected!');
    
    const res = await client.query('SELECT NOW()');
    console.log('Server time:', res.rows[0].now);
    
    await client.end();
  } catch (err) {
    console.error('\n❌ Connection failed:');
    console.error('   Message:', err.message);
    console.error('   Code:', err.code);
    console.error('   Stack:', err.stack);
  }
}

test();