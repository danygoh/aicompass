import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const LIMIT = 100;
const WINDOW_MS = 60 * 1000;

function getClientIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
    || request.headers.get('x-real-ip')
    || 'unknown';
}

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Skip for non-API routes
  if (!path.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Skip for auth routes - use NextAuth built-in
  if (path.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  const clientIP = getClientIP(request);
  const now = Date.now();
  
  let record = rateLimitMap.get(clientIP);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(clientIP, { count: 1, resetTime: now + WINDOW_MS });
    return NextResponse.next();
  }
  
  if (record.count >= LIMIT) {
    return NextResponse.json(
      { error: 'Too many requests', message: `Rate limit exceeded. Max ${LIMIT} requests per minute.` },
      { status: 429 }
    );
  }
  
  record.count++;
  rateLimitMap.set(clientIP, record);
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
