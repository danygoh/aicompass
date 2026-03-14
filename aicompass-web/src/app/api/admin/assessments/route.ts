import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { auditLog } from '@/lib/audit';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const assessments = await prisma.assessment.findMany({
      include: {
        user: {
          include: { profile: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = assessments.map(a => ({
      id: a.id,
      userId: a.userId,
      userName: a.user?.name || a.user?.profile?.firstName + ' ' + a.user?.profile?.lastName || 'Unknown',
      userEmail: a.user?.email || '',
      company: a.user?.profile?.company || '',
      status: a.status.toLowerCase(),
      tier: a.tier,
      score: a.totalScore,
      completedAt: a.completedAt?.toISOString() || null,
      createdAt: a.createdAt.toISOString()
    }));

    return NextResponse.json({ assessments: formatted });
  } catch (error: any) {
    console.error('Get assessments error:', error);
    return NextResponse.json({ error: 'Failed to fetch assessments' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    await prisma.assessment.delete({
      where: { id }
    });

    // Audit log
    await auditLog({
      action: 'ASSESSMENT_DELETED',
      entityType: 'assessment',
      entityId: id,
      userId: (session.user as any)?.id,
      userEmail: (session.user as any)?.email,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete assessment error:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
