import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import { query } from '@/lib/db';

// GET contributions for current user
export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();

    const contributions = await query(
      'SELECT id, amount, description, created_at FROM contributions WHERE user_id = $1 ORDER BY created_at DESC',
      [session.id]
    );

    return NextResponse.json({ contributions }, { status: 200 });
  } catch (error) {
    console.error('Get contributions error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to get contributions' }, { status: 500 });
  }
}

// POST - Add contribution
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const { amount, description } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Valid amount is required' },
        { status: 400 }
      );
    }

    const result = await query(
      'INSERT INTO contributions (user_id, amount, description, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id, amount, description, created_at',
      [session.id, amount, description || null]
    );

    if (!result || result.length === 0) {
      return NextResponse.json(
        { error: 'Failed to add contribution' },
        { status: 500 }
      );
    }

    return NextResponse.json({ contribution: result[0] }, { status: 201 });
  } catch (error) {
    console.error('Add contribution error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to add contribution' }, { status: 500 });
  }
}
