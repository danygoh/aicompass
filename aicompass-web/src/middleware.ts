import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limiter (for development)
// For production, use @upstash/ratelimit with Redis
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const authRateLimitMap = new Map<string, { count: number; resetTime: number; lockedUntil?: number }>();

// Config: 100 requests per minute for general API
const LIMIT = 100;
const AUTH_LIMIT = 10; // 10 attempts per minute for auth
const AUTH_LOCKOUT_MS = 15 * 60 * 1000; // 15 minute lockout after 5 failures
const WINDOW_MS = 60 * 1000; // 1 minute

// Admin IP allowlist (set via environment variable, comma-separated)
const ADMIN_IPS = process.env.ADMIN_ALLOWED_IPS?.split(',').map(ip => ip.trim()).filter(Boolean) || [];

function getClientIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
    || request.headers.get('x-real-ip')
    || 'unknown';
}

export function middleware(request: NextRequest) {
  const clientIP = getClientIP(request);
  const now = Date.now();
  const path = request.nextUrl.pathname;

  // Phase 2: Admin IP Allowlist
  if (path.startsWith('/api/admin/') && ADMIN_IPS.length > 0) {
    if (!ADMIN_IPS.includes(clientIP) && !ADMIN_IPS.includes('*')) {
      console.log(`[Security] Admin access denied from IP: ${clientIP}`);
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
  }

  // Handle auth-specific rate limiting
  if (path.startsWith('/api/auth/')) {
    // Check if locked out
    const authRecord = authRateLimitMap.get(clientIP);
    if (authRecord?.lockedUntil && now < authRecord.lockedUntil) {
      const remainingSeconds = Math.ceil((authRecord.lockedUntil - now) / 1000);
      return NextResponse.json(
        { error: 'Account locked', message: `Too many failed attempts. Try again in ${remainingSeconds} seconds.` },
        { status: 429, headers: { 'Retry-After': String(remainingSeconds) } }
      );
    }

    // Check auth rate limit
    let authRecord: { count: number; resetTime: number; lockedUntil?: number } = { count: 1, resetTime: now + WINDOW_MS };
    const existingAuthRecord = authRateLimitMap.get(clientIP);
    if (existingAuthRecord && now <= existingAuthRecord.resetTime) {
      authRecord = existingAuthRecord;
    }

    // For failed login attempts (POST to signin), increment failure count
    if (path.includes('signin') && request.method === 'POST') {
      authRecord.count++;
      
      // Lock out after 5 failed attempts
      if (authRecord.count > 5) {
        authRecord.lockedUntil = now + AUTH_LOCKOUT_MS;
        authRateLimitMap.set(clientIP, authRecord);
        return NextResponse.json(
          { error: 'Account locked', message: 'Too many failed login attempts. Try again in 15 minutes.' },
          { status: 429 }
        );
      }
      
      authRateLimitMap.set(clientIP, authRecord);
    }

    // Allow up to AUTH_LIMIT requests per minute
    if (authRecord.count >= AUTH_LIMIT) {
      return NextResponse.json(
        { error: 'Too many requests', message: `Max ${AUTH_LIMIT} auth attempts per minute.` },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((authRecord.resetTime - now) / 1000)) } }
      );
    }
    
    authRecord.count++;
    authRateLimitMap.set(clientIP, authRecord);
    
    return NextResponse.next();
  }

  // General API rate limiting
  if (!path.startsWith('/api/')) {
    return NextResponse.next();
  }

  const record = rateLimitMap.get(clientIP) || { count: 0, resetTime: 0 };
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(clientIP, { count: 1, resetTime: now + WINDOW_MS });
    return NextResponse.next();
  }
  
  if (record.count >= LIMIT) {
    return NextResponse.json(
      { error: 'Too many requests', message: `Rate limit exceeded. Max ${LIMIT} requests per minute.` },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((record.resetTime - now) / 1000)) } }
    );
  }
  
  record.count++;
  rateLimitMap.set(clientIP, record);
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*', '/api/auth/:path*'],
};
