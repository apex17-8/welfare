// lib/db.ts
import { neon } from '@neondatabase/serverless';

console.log('🔌 Initializing database connection...');
console.log('📊 Database host:', process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'unknown');

// Initialize the Neon connection
const sql = neon(process.env.DATABASE_URL!);

// Test connection immediately
(async () => {
  try {
    console.log('🔄 Testing database connection...');
    const result = await sql`SELECT NOW() as time`;
    console.log('✅ Database connected successfully!');
    console.log('📅 Database time:', result[0].time);
  } catch (err: any) {
    console.error('❌ Initial database connection failed:', err.message);
    console.error('🔍 Error details:', {
      code: err.code,
      message: err.message
    });
  }
})();

export async function query(text: string, params?: any[]) {
  const startTime = Date.now();
  console.log(`📝 Executing query: ${text.substring(0, 100)}...`);
  
  try {
    // For parameterized queries with neon
    // Convert the text query to a parameterized query
    let result;
    if (params && params.length > 0) {
      // Handle parameterized queries
      // This is a simple implementation - for complex queries you might need to adjust
      const paramPlaceholders = text.replace(/\$(\d+)/g, (_, index) => {
        return `$${index}`;
      });
      result = await sql(text, params);
    } else {
      result = await sql(text);
    }
    
    const duration = Date.now() - startTime;
    console.log(`✅ Query completed in ${duration}ms, rows: ${result.length}`);
    return result;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`❌ Query failed after ${duration}ms:`, error.message);
    
    // Provide helpful error messages
    if (error.message.includes('timeout') || error.code === 'ETIMEDOUT') {
      throw new Error('Database connection timeout. Please check your network and database settings.');
    } else if (error.message.includes('ECONNREFUSED')) {
      throw new Error('Database connection refused. Please check if the database server is running.');
    } else if (error.message.includes('password authentication')) {
      throw new Error('Database authentication failed. Please check your username and password.');
    } else if (error.message.includes('does not exist')) {
      throw new Error('Database does not exist. Please check your database name.');
    }
    
    throw error;
  }
}

export async function queryOne(text: string, params?: any[]) {
  const rows = await query(text, params);
  return rows[0] || null;
}

export async function execute(text: string, params?: any[]) {
  try {
    return await sql(text, params);
  } catch (error) {
    console.error('Database execute error:', error);
    throw error;
  }
}