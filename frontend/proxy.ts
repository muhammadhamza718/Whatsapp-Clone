import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Exclude Better Auth's own API routes so login/register flows can execute
  if (path.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  try {
    // We fetch the session from Better-Auth's built-in session endpoint
    const response = await fetch(new URL('/api/auth/get-session', request.url).toString(), {
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
    });

    const sessionData = await response.json();

    // If there is no active session, reject the request
    if (!sessionData || !sessionData.session) {
      // For API routes, return a 401 Unauthorized JSON response
      if (path.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      
      // For protected pages like /dashboard, redirect to the login page
      return NextResponse.redirect(new URL('/login', request.url));
    }
  } catch (_error) {
    // If the fetch fails for any reason, default to rejecting access
    if (path.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Session is valid, allow request to proceed
  return NextResponse.next();
}

// Next.js 16 matcher configuration
export const config = {
  // Protect all API routes and future protected pages like /dashboard
  matcher: ['/dashboard/:path*', '/api/:path*'],
};
