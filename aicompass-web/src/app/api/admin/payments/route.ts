import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payments = await prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true },
        },
        cohort: {
          select: { name: true },
        },
      },
    });

    const formatted = payments.map(p => ({
      id: p.id,
      user: p.user?.name || 'Unknown',
      email: p.user?.email || '',
      org: p.cohort?.name || p.user?.name || 'Unknown',
      plan: p.cohort ? 'Cohort' : 'Professional',
      amount: p.amount / 100,
      status: p.status.toLowerCase(),
      date: p.paidAt?.toISOString().split('T')[0] || p.createdAt.toISOString().split('T')[0],
    }));

    return NextResponse.json({ payments: formatted });
  } catch (error: any) {
    console.error('Payments API error:', error);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}
