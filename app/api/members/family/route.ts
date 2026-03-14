import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import { query } from '@/lib/db';

// GET family members for current user
export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();

    const members = await query(
      'SELECT id, family_id, status FROM family_members WHERE user_id = $1 ORDER BY added_at ASC',
      [session.id]
    );

    return NextResponse.json({ members }, { status: 200 });
  } catch (error) {
    console.error('[v0] Get family members error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to get family members' }, { status: 500 });
  }
}

// POST - Add family member
export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const { familyId } = await req.json();

    if (!familyId) {
      return NextResponse.json(
        { error: 'Family ID is required' },
        { status: 400 }
      );
    }

    const result = await query(
      'INSERT INTO family_members (user_id, family_id, status, added_at) VALUES ($1, $2, $3, NOW()) RETURNING id, family_id, status',
      [session.id, familyId, 'active']
    );

    if (!result || result.length === 0) {
      return NextResponse.json(
        { error: 'Failed to add family member' },
        { status: 500 }
      );
    }

    return NextResponse.json({ member: result[0] }, { status: 201 });
  } catch (error) {
    console.error('[v0] Add family member error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to process family member' }, { status: 500 });
  }
}
