import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { query } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get fresh user data from public.users
    const users = await query('SELECT id, email, name, status FROM public.users WHERE id = $1', [
      session.id,
    ]);

    if (!users || users.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = users[0];

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.name,
          status: user.status,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Get session error:', error);
    return NextResponse.json(
      { error: 'Failed to get user' },
      { status: 500 }
    );
  }
}
