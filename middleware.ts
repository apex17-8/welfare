import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // List of completely public paths that bypass ALL auth checks
  const publicPaths = [
    '/',
    '/login',
    '/register',
    '/api/manifest', // Explicitly allow the manifest API route
  ];

  // Check if current path is in public paths
  if (publicPaths.includes(pathname)) {
    // For login/register, still check if user is already logged in
    if (pathname === '/login' || pathname === '/register') {
      const token = request.cookies.get('auth_token')?.value;
      if (token) {
        const payload = await verifyToken(token);
        if (payload) {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      }
    }
    return NextResponse.next();
  }

  // Check for static files (anything with a file extension)
  const isStaticFile = /\.[^/]+$/.test(pathname);
  if (isStaticFile) {
    return NextResponse.next();
  }

  // Check for API routes (except manifest which is already handled)
  if (pathname.startsWith('/api/') && pathname !== '/api/manifest') {
    // API routes might need their own auth, but we'll let them handle it
    return NextResponse.next();
  }

  // Get auth token for protected routes
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
  if (pathname.startsWith('/admin')) {
    const userRole = (payload as any)?.role;
    if (userRole !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Allow request
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon)
     * - All static files with extensions (.png, .jpg, etc.)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
};
