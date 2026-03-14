import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { token, email, newPassword, confirmPassword } = await req.json();

    // Validate input
    if (!token || !email || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Find user and valid token
    const resetRecord = await query(
      `SELECT prt.id, prt.user_id, prt.expires_at, u.id as user_id_check, u.email
       FROM password_reset_tokens prt
       JOIN users u ON prt.user_id = u.id
       WHERE prt.token = $1 AND u.email = $2 AND prt.expires_at > NOW()`,
      [token, email]
    );

    if (!resetRecord || resetRecord.length === 0) {
      return NextResponse.json(
        { error: 'Invalid or expired reset link' },
        { status: 400 }
      );
    }

    const record = resetRecord[0];

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user password and mark as active if pending
    await query(
      `UPDATE users 
       SET password_hash = $1, status = 'active', updated_at = NOW()
       WHERE id = $2`,
      [hashedPassword, record.user_id]
    );

    // Delete the used token
    await query(
      'DELETE FROM password_reset_tokens WHERE id = $1',
      [record.id]
    );

    // Delete all other tokens for this user (invalidate all reset links)
    await query(
      'DELETE FROM password_reset_tokens WHERE user_id = $1',
      [record.user_id]
    );

    console.log('[v0] Password reset successful for user:', record.user_id);

    return NextResponse.json(
      { success: true, message: 'Password has been reset successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Reset password error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
