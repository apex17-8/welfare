import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // PUBLIC PATHS - No authentication required
  const publicPaths = [
    '/',
    '/login',
    '/register',
    '/manifest.json',
    '/favicon.ico',
    '/api/auth/login',
    '/api/auth/register',
    '/api/manifest',
  ];

  // Check if current path is public
  if (publicPaths.some(path => pathname === path || pathname.startsWith(path + '/'))) {
    // Special handling for login/register - redirect if already authenticated
    if (pathname === '/login' || pathname === '/register') {
      const token = request.cookies.get('auth_token')?.value;
      if (token) {
        try {
          const payload = await verifyToken(token);
          if (payload) {
            return NextResponse.redirect(new URL('/dashboard', request.url));
          }
        } catch {
          // Token invalid, continue to login page
        }
      }
    }
    return NextResponse.next();
  }

  // STATIC FILES - Bypass authentication for all files with extensions
  const staticFilePattern = /\.(ico|json|png|jpg|jpeg|svg|webp|css|js|txt|xml|woff|woff2|ttf|eot)$/;
  if (staticFilePattern.test(pathname)) {
    return NextResponse.next();
  }

  // API ROUTES - Let them handle their own authentication
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // PROTECTED ROUTES - Require authentication
  const token = request.cookies.get('auth_token')?.value;

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const payload = await verifyToken(token);
    
    if (!payload) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Admin route protection
    if (pathname.startsWith('/admin')) {
      const userRole = (payload as any)?.role;
      if (userRole !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    // Match all paths except _next internals
    '/((?!_next/static|_next/image).*)',
  ],
};
