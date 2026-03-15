import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Find the token
    const magicToken = await prisma.magicToken.findUnique({
      where: { token },
      include: {
        user: {
          include: {
            assessments: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    if (!magicToken) {
      return NextResponse.json(
        { error: 'Invalid or expired link' },
        { status: 400 }
      );
    }

    // Check if expired
    if (new Date() > magicToken.expiresAt) {
      return NextResponse.json(
        { error: 'This link has expired' },
        { status: 400 }
      );
    }

    // Check if already used
    if (magicToken.usedAt) {
      return NextResponse.json(
        { error: 'This link has already been used' },
        { status: 400 }
      );
    }

    // Mark token as used
    await prisma.magicToken.update({
      where: { id: magicToken.id },
      data: { usedAt: new Date() },
    });

    // Return user info and latest assessment
    const user = magicToken.user;
    const latestAssessment = user.assessments[0];

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      assessment: latestAssessment ? {
        id: latestAssessment.id,
        status: latestAssessment.status,
        totalScore: latestAssessment.totalScore,
        tier: latestAssessment.tier,
      } : null,
    });
  } catch (error) {
    console.error('Error verifying magic link:', error);
    return NextResponse.json(
      { error: 'Failed to verify link' },
      { status: 500 }
    );
  }
}
