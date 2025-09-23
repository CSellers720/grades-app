import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Minimal middleware that checks for a JWT stored in the cookie named `token`.
// For a real app you should verify signatures server-side. This example performs
// a light-weight expiration check based on the token payload (base64 JSON) so
// we can redirect unauthenticated users to `/login`.

const PUBLIC_FILE = /\.(.*)$/;

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public files and the login/API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/public') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/login') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get('token')?.value;

  if (!token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('from', req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // try a lightweight expiry check: JWT are three dot-separated parts.
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
      if (payload.exp && typeof payload.exp === 'number') {
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp < now) {
          const loginUrl = new URL('/login', req.url);
          loginUrl.searchParams.set('from', req.nextUrl.pathname);
          return NextResponse.redirect(loginUrl);
        }
      }
    }
  } catch (e) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('from', req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
};
