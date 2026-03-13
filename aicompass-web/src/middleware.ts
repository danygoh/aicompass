import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limiter (for development)
// For production, use @upstash/ratelimit with Redis
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Config: 100 requests per minute
const LIMIT = 100;
const WINDOW_MS = 60 * 1000; // 1 minute

function getClientIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
    || request.headers.get('x-real-ip')
    || 'unknown';
}

export function middleware(request: NextRequest) {
  // Only rate limit API routes
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Skip rate limiting for auth endpoints (they have their own handling)
  if (request.nextUrl.pathname.startsWith('/api/auth/')) {
    return NextResponse.next();
  }

  const clientIP = getClientIP(request);
  const now = Date.now();
  
  const record = rateLimitMap.get(clientIP);
  
  if (!record || now > record.resetTime) {
    // New window
    rateLimitMap.set(clientIP, { count: 1, resetTime: now + WINDOW_MS });
    return NextResponse.next();
  }
  
  if (record.count >= LIMIT) {
    // Rate limited
    return NextResponse.json(
      { error: 'Too many requests', message: `Rate limit exceeded. Max ${LIMIT} requests per minute.` },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((record.resetTime - now) / 1000)) } }
    );
  }
  
  // Increment count
  record.count++;
  rateLimitMap.set(clientIP, record);
  
  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
