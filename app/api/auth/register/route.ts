import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, createToken } from '@/lib/auth';
import { query } from '@/lib/db';
import { setSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const { email, password, fullName, phoneNumber, role = 'member' } = await req.json();

    // Validate input
    if (!email || !password || !fullName || !phoneNumber) {
      return NextResponse.json(
        { error: 'Missing required fields: email, password, fullName, phoneNumber' },
        { status: 400 }
      );
    }

    // Validate phone number format (Kenya: +254 or 0)
    const phoneRegex = /^(\+254|0)[0-9]{9}$/;
    if (!phoneRegex.test(phoneNumber.replace(/\s/g, ''))) {
      return NextResponse.json(
        { error: 'Invalid phone number. Use format: +254XXXXXXXXX or 0XXXXXXXXX' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1 OR phone_number = $2',
      [email, phoneNumber.replace(/\s/g, '')]
    );

    if (existingUser && existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Email or phone number already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user in public.users table - status is NULL for new users (not 'pending' or 'unverified')
    const newUser = await query(
      'INSERT INTO public.users (email, password_hash, name, phone_number) VALUES ($1, $2, $3, $4) RETURNING id, email, name, phone_number',
      [email, hashedPassword, fullName, phoneNumber.replace(/\s/g, '')]
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
      role: 'member',
    });

    // Set session
    await setSession(token);

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.name,
          phoneNumber: user.phone_number,
          role: 'member',
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[v0] Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
