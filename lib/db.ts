// lib/db.ts
import { neon } from '@neondatabase/serverless';

// Initialize the connection
const sql = neon(process.env.DATABASE_URL!);

export async function query(text: string, params?: any[]) {
  console.log(`[v0] Executing query: ${text.substring(0, 50)}...`);
  
  try {
    // Always use sql.query() for consistent parameterized query handling
    // This works for both queries with and without parameters
    const result = await sql.query(text, params || []);
    return result;
  } catch (error: any) {
    console.error('[v0] Database query error:', error.message);
    throw error;
  }
}

export async function queryOne(text: string, params?: any[]) {
  const rows = await query(text, params);
  return rows[0] || null;
}
