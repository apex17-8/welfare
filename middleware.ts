import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  // Immediately return for manifest.json
  if (request.nextUrl.pathname === '/manifest.json') {
    return NextResponse.next();
  }

  // Rest of your middleware logic...
  const { pathname } = request.nextUrl;
  const publicRoutes = ['/', '/login', '/register'];

  if (publicRoutes.includes(pathname)) {
    const token = request.cookies.get('auth_token')?.value;
    if (token && (pathname === '/login' || pathname === '/register')) {
      const payload = await verifyToken(token);
      if (payload) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
    return NextResponse.next();
  }

  const token = request.cookies.get('auth_token')?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (pathname.startsWith('/admin')) {
    const userRole = (payload as any)?.role;
    if (userRole !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Exclude manifest.json explicitly
    '/((?!manifest.json|_next/static|_next/image|favicon.ico).*)',
  ],
};
