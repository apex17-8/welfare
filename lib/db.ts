// lib/db.ts
import { neon } from '@neondatabase/serverless';

// Initialize the connection
const sql = neon(process.env.DATABASE_URL!);

export async function query(text: string, params?: any[]) {
  console.log(`[v0] Executing query: ${text.substring(0, 50)}...`);
  
  try {
    let result;
    if (params && params.length > 0) {
      // For parameterized queries with $1, $2, etc., use sql.query()
      result = await sql.query(text, params);
    } else {
      // For queries without parameters, sql() can be called as a tagged template
      // But we need to convert to call signature - use sql.query() with empty params for consistency
      result = await sql.query(text, []);
    }
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
