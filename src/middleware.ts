import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Force HTTPS redirect in production
  // Check both the URL protocol and the forwarded protocol header
  const isProduction = process.env.NODE_ENV === 'production'
  const forwardedProto = request.headers.get('x-forwarded-proto')
  const urlProtocol = request.nextUrl.protocol
  
  if (
    isProduction &&
    urlProtocol === 'http:' &&
    forwardedProto !== 'https'
  ) {
    const url = request.nextUrl.clone()
    url.protocol = 'https:'
    return NextResponse.redirect(url, 301)
  }

  return NextResponse.next()
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
}

