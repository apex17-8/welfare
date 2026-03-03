import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes (no auth required)
  const publicRoutes = ['/', '/login', '/register'];

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    // If user is already logged in and tries to access login/register,
    // redirect them to dashboard
    const token = request.cookies.get('auth_token')?.value;

    if (token && (pathname === '/login' || pathname === '/register')) {
      const payload = await verifyToken(token);
      if (payload) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    return NextResponse.next();
  }

  // Get auth token
  const token = request.cookies.get('auth_token')?.value;

  // No token → redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verify token
  const payload = await verifyToken(token);

  if (!payload) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Admin-only protection
  if (pathname.startsWith('/admin') && payload.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Allow request
  return NextResponse.next();
}

/*
  IMPORTANT:
  This matcher excludes:
  - API routes
  - Next.js internals
  - ALL static files (anything with a file extension)
*/
export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};