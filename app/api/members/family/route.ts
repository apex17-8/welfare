import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import { query } from '@/lib/db';

// GET family members for current user
export async function GET(req: NextRequest) {
  try {
    const session = await requireAuth();

    const members = await query(
      'SELECT id, full_name, relationship, date_of_birth, id_number FROM family_members WHERE user_id = $1 ORDER BY created_at ASC',
      [session.id]
    );

    return NextResponse.json({ members }, { status: 200 });
  } catch (error) {
    console.error('Get family members error:', error);
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
    const { fullName, relationship, dateOfBirth, idNumber } = await req.json();

    if (!fullName || !relationship) {
      return NextResponse.json(
        { error: 'Full name and relationship are required' },
        { status: 400 }
      );
    }

    const result = await query(
      'INSERT INTO family_members (user_id, full_name, relationship, date_of_birth, id_number, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id, full_name, relationship, date_of_birth, id_number',
      [session.id, fullName, relationship, dateOfBirth, idNumber]
    );

    if (!result || result.length === 0) {
      return NextResponse.json(
        { error: 'Failed to add family member' },
        { status: 500 }
      );
    }

    return NextResponse.json({ member: result[0] }, { status: 201 });
  } catch (error) {
    console.error('Add family member error:', error);
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to add family member' }, { status: 500 });
  }
}
