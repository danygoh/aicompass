import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const assessments = await prisma.assessment.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    const formatted = assessments.map(a => ({
      id: a.reportId || `AIC-${a.id.slice(0, 8)}`,
      user: a.user?.name || a.user?.profile?.firstName + ' ' + a.user?.profile?.lastName || 'Anonymous',
      company: a.user?.profile?.company || 'Unknown',
      score: a.totalScore,
      tier: a.tier,
      status: a.status,
      completedAt: a.completedAt?.toISOString().split('T')[0] || null,
    }));

    return NextResponse.json({ assessments: formatted });
  } catch (error: any) {
    console.error('Admin assessments error:', error);
    return NextResponse.json({ error: 'Failed to fetch assessments' }, { status: 500 });
  }
}
