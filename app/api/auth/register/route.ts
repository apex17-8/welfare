import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, createToken } from '@/lib/auth';
import { query } from '@/lib/db';
import { setSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const { email, password, fullName, role = 'member' } = await req.json();

    // Validate input
    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser && existingUser.length > 0) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const newUser = await query(
      'INSERT INTO users (email, password_hash, full_name, role, status) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, full_name, role',
      [email, hashedPassword, fullName, role, 'active']
    );

    if (!newUser || newUser.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    const user = newUser[0];

    // Create token
    const token = await createToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Set session
    await setSession(token);

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
