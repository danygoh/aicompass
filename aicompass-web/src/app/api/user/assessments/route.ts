import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;

    const assessments = await prisma.assessment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        report: true,
      },
    });

    const formattedAssessments = assessments.map((a) => ({
      id: a.id,
      reportId: a.report?.reportId || `AIC-${a.id.slice(0, 8)}`,
      totalScore: a.totalScore,
      tier: a.tier,
      status: a.status,
      completedAt: a.completedAt?.toISOString(),
      createdAt: a.createdAt.toISOString(),
    }));

    return NextResponse.json({ assessments: formattedAssessments });
  } catch (error: any) {
    console.error('Fetch assessments error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessments' },
      { status: 500 }
    );
  }
}
