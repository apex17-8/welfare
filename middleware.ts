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
    // Match all routes except:
    // - api (API routes)
    // - _next/static (Next.js static files)
    // - _next/image (Next.js image optimization)
    // - favicon.ico
    // - manifest.json (web manifest)
    // - sw.js (service worker)
    // - files with common extensions (images, fonts, css, js)
    '/((?!api|_next/static|_next/image|favicon\\.ico|manifest\\.json|sw\\.js|.*\\.(?:png|jpg|jpeg|svg|webp|woff|woff2|css|js)$).*)',
  ],
};
