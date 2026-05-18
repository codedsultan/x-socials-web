import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Protected route prefixes — any request to these paths requires authentication.
 * The check is token presence only (JWT validation happens on the API).
 * A full server-side JWT verify would require the secret here; we trust the
 * API to return 401 and the client to redirect via the ky afterResponse hook.
 */
const PROTECTED = ['/feed', '/posts', '/users', '/search'];
const AUTH_ONLY = ['/login', '/register']; // redirect authed users away from these

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read access token from the cookie set by the auth store's localStorage
  // Note: Zustand persist writes to localStorage (client-only). For true SSR
  // protection, set an httpOnly cookie on login. This middleware covers the
  // common case where the cookie is set via a custom approach.
  // For now we check the x-socials-auth key in cookies as a lightweight signal.
  const authCookie = request.cookies.get('x-socials-authed');
  const isAuthed   = authCookie?.value === '1';

  const isProtected = PROTECTED.some(p => pathname.startsWith(p));
  const isAuthRoute  = AUTH_ONLY.some(p => pathname.startsWith(p));

  if (isProtected && !isAuthed) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && isAuthed) {
    const url = request.nextUrl.clone();
    url.pathname = '/feed';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - api routes
     * - _next static files
     * - favicon
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
