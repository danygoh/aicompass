import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const where = userId ? { userId } : {};

    const assessments = await prisma.assessment.findMany({
      where: {
        ...where,
        status: 'COMPLETED',
      },
      include: {
        user: {
          include: { profile: true }
        },
      },
      orderBy: { completedAt: 'desc' },
    });

    const reports = assessments.map(a => ({
      id: a.id,
      userId: a.userId,
      userName: a.user?.name || a.user?.profile?.firstName + ' ' + a.user?.profile?.lastName || 'Unknown',
      email: a.user?.email,
      company: a.user?.profile?.company || '',
      industry: a.user?.profile?.industry || '',
      totalScore: a.totalScore,
      tier: a.tier,
      dimensionScores: a.dimensionScores,
      completedAt: a.completedAt,
    }));

    return NextResponse.json({ reports });
  } catch (error: any) {
    console.error('Admin reports error:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}
