import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await query(
      'SELECT id, email FROM users WHERE email = $1',
      [email]
    );

    if (!user || user.length === 0) {
      // Don't reveal if email exists for security
      return NextResponse.json(
        { success: true, message: 'If email exists, a reset link will be sent' },
        { status: 200 }
      );
    }

    // Generate reset token (32 bytes = 64 hex chars)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store token in database
    await query(
      `INSERT INTO password_reset_tokens (user_id, token, expires_at, created_at)
       VALUES ($1, $2, $3, $4)`,
      [user[0].id, resetToken, expiresAt, new Date()]
    );

    // In production, send email with reset link
    // For now, return token for testing (remove in production)
    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    console.log('[v0] Password reset link:', resetLink);

    return NextResponse.json(
      {
        success: true,
        message: 'If email exists, a reset link will be sent',
        // Remove this in production - only for testing
        resetLink: process.env.NODE_ENV === 'development' ? resetLink : undefined,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
