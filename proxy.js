import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function proxy(request) {
  const { pathname } = request.nextUrl;

  // Public routes (no auth required)
  const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/reset-password'];

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

  // Admin-only protection - check if role exists and equals 'admin'
  if (pathname.startsWith('/admin')) {
    const userRole = payload?.role;
    if (userRole !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
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
  matcher: [
    // Match all routes except:
    // - api routes
    // - _next (Next.js internals)
    // - static files (with extensions: .ico, .json, .txt, .xml, etc.)
    // - images, fonts, etc.
    '/((?!api|_next|manifest\\.json|sw\\.js|favicon\\.ico|.*\\.png|.*\\.jpg|.*\\.svg|.*\\.webp|.*\\.woff|.*\\.woff2).*)',
  ],
};
