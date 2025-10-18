import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Only redirect for the root path
  const accessToken = request.cookies.get('access_token');
  if (request.nextUrl.pathname === '/') {
    // Check for authentication (example: cookie named 'access_token')
    if (!accessToken) {
      // Redirect to login page if not authenticated
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }
  if (accessToken) {
    // If authenticated, allow access to the chat page
    return NextResponse.redirect(new URL('/chat', request.url));
  }
  // Allow all other requests
  return NextResponse.next();
}

export const config = {
  matcher: ['/'],
};
