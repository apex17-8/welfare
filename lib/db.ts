// lib/db.ts
import { neon } from '@neondatabase/serverless';

// Initialize the connection
const sql = neon(process.env.DATABASE_URL!);

export async function query(text: string, params?: any[]) {
  console.log(`📝 Executing query: ${text.substring(0, 50)}...`);
  
  try {
    let result;
    if (params && params.length > 0) {
      // For parameterized queries
      result = await sql(text, params);
    } else {
      result = await sql(text);
    }
    
    return result;
  } catch (error: any) {
    console.error('❌ Database query error:', error.message);
    throw error;
  }
}

export async function queryOne(text: string, params?: any[]) {
  const rows = await query(text, params);
  return rows[0] || null;
}