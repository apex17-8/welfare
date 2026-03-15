import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for all static files and public assets
  const isStaticFile = pathname.includes('.') || 
                      pathname.startsWith('/_next') || 
                      pathname === '/manifest.json' ||
                      pathname === '/favicon.ico';
  
  if (isStaticFile) {
    return NextResponse.next();
  }

  // Public routes (no auth required)
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

  // Check authentication for all other routes
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
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|manifest.json).*)'],
};
