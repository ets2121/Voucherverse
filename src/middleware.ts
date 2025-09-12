
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import appConfig from '../public/config.json';

// 1. Specify protected and public routes
const allowedRoutes = new Set(appConfig.navigation.map(item => item.href));
allowedRoutes.add('/'); // Always allow the homepage

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow API routes, internal Next.js routes, and static files
  if (pathname.startsWith('/api/') || 
      pathname.startsWith('/_next/') || 
      pathname.includes('.') // for files like favicon.ico
     ) {
    return NextResponse.next();
  }

  // Check if the requested pathname is in the allowed list
  if (!allowedRoutes.has(pathname)) {
    // If not, redirect to the not-found page
    const url = request.nextUrl.clone();
    url.pathname = '/not-found';
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - api (API routes)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    '/((?!api|_next/static|_next/image|favicon.ico).*)'
  ],
};
