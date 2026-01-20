import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Force HTTPS redirect in production
  const isProduction = process.env.NODE_ENV === 'production';
  const forwardedProto = request.headers.get('x-forwarded-proto');
  const urlProtocol = request.nextUrl.protocol;

  if (
    isProduction &&
    urlProtocol === 'http:' &&
    forwardedProto !== 'https'
  ) {
    const url = request.nextUrl.clone();
    url.protocol = 'https:';
    return NextResponse.redirect(url, 301);
  }

  // Non-dashboard routes: skip auth, just set pathname header and continue
  if (!request.nextUrl.pathname.startsWith('/dashboard')) {
    const response = NextResponse.next();
    response.headers.set('x-pathname', request.nextUrl.pathname);
    return response;
  }

  // Dashboard login page: skip auth check
  if (request.nextUrl.pathname === '/dashboard/login') {
    const response = NextResponse.next();
    response.headers.set('x-pathname', request.nextUrl.pathname);
    return response;
  }

  // Dashboard routes: require authentication
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase credentials');
    const response = NextResponse.next();
    response.headers.set('x-pathname', request.nextUrl.pathname);
    return response;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Get access token from cookie
  const accessToken = request.cookies.get('sb-access-token')?.value;

  if (!accessToken) {
    const loginUrl = new URL('/dashboard/login', request.url);
    loginUrl.searchParams.set('redirectTo', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Verify session
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);

  if (error || !user) {
    const loginUrl = new URL('/dashboard/login', request.url);
    loginUrl.searchParams.set('redirectTo', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Authenticated user: set pathname header and continue
  const response = NextResponse.next();
  response.headers.set('x-pathname', request.nextUrl.pathname);
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|xml|txt)).*)',
  ],
};
