import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin routes authentication
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('token')?.value;

    // Allow access to login page
    if (pathname === '/admin/login') {
      // If already logged in, redirect to dashboard
      if (token) {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      return NextResponse.next();
    }

    // For all other admin routes, require authentication
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
