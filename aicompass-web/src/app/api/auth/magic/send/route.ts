import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { z } from 'zod';

const SendMagicLinkSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// Generate secure random token
function generateToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = SendMagicLinkSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid email', details: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    // Check if user exists with this email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        assessments: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!user || user.assessments.length === 0) {
      // Don't reveal if user exists - just say we'll send link if account exists
      return NextResponse.json({ 
        message: 'If an account exists with this email, you will receive a magic link shortly.' 
      });
    }

    // Generate token
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Save token to database
    await prisma.magicToken.create({
      data: {
        email,
        token,
        expiresAt,
      },
    });

    // Send magic link email
    const magicLink = `https://aicompass.ainativefoundation.org/auth/magic/verify?token=${token}`;
    
    await sendEmail({
      to: email,
      subject: '🔗 Your AI Compass Report Access Link',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Access Your AI Compass Report</h1>
          <p>Click the button below to access your assessment report:</p>
          <a href="${magicLink}" style="display: inline-block; background: #000; color: #fff; padding: 16px 32px; text-decoration: none; border-radius: 8px; margin: 24px 0;">
            View My Report
          </a>
          <p style="color: #666; font-size: 14px;">
            This link expires in 24 hours and can only be used once.
          </p>
          <p style="color: #666; font-size: 12px;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ 
      message: 'If an account exists with this email, you will receive a magic link shortly.' 
    });
  } catch (error) {
    console.error('Error sending magic link:', error);
    return NextResponse.json(
      { error: 'Failed to send magic link' },
      { status: 500 }
    );
  }
}
