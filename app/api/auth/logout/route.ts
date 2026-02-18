import { NextRequest, NextResponse } from 'next/server';
import { clearSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    await clearSession();
    return NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
  }
}
