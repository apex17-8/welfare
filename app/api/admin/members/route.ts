import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/session';
import { query } from '@/lib/db';

// GET all members
export async function GET(req: NextRequest) {
  try {
    await requireRole(['admin']);

    const members = await query(
      'SELECT id, email, full_name, role, status, created_at FROM users ORDER BY created_at DESC'
    );

    return NextResponse.json({ members }, { status: 200 });
  } catch (error) {
    console.error('Get members error:', error);
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Failed to get members' }, { status: 500 });
  }
}

// POST - Create or update member status
export async function POST(req: NextRequest) {
  try {
    await requireRole(['admin']);

    const { userId, action } = await req.json();

    if (action === 'approve') {
      const result = await query(
        'UPDATE users SET status = $1 WHERE id = $2 RETURNING id, email, full_name, status',
        ['active', userId]
      );

      if (!result || result.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      // Log approval
      await query(
        'INSERT INTO approval_logs (user_id, action, approved_by, created_at) VALUES ($1, $2, $3, NOW())',
        [userId, 'approved', req.headers.get('x-user-id')]
      );

      return NextResponse.json({ user: result[0] }, { status: 200 });
    }

    if (action === 'reject') {
      const result = await query(
        'UPDATE users SET status = $1 WHERE id = $2 RETURNING id, email, full_name, status',
        ['rejected', userId]
      );

      if (!result || result.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      // Log rejection
      await query(
        'INSERT INTO approval_logs (user_id, action, approved_by, created_at) VALUES ($1, $2, $3, NOW())',
        [userId, 'rejected', req.headers.get('x-user-id')]
      );

      return NextResponse.json({ user: result[0] }, { status: 200 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Member action error:', error);
    if (error instanceof Error && error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
