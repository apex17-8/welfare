// proxy.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/'];

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Get token from cookies
  const token = request.cookies.get('auth_token')?.value;

  // Redirect if no token
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verify token
  const payload = await verifyToken(token);

  if (!payload) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Admin-only routes
  if (pathname.startsWith('/admin') && payload.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Continue normally
  return NextResponse.next();
}

// Exclude static files and API routes from the proxy
export const config = {
  matcher: [
    '/((?!api|_next|favicon.ico|manifest.json|sw.js).*)',
  ],
};
