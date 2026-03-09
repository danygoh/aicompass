import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const tier = searchParams.get('tier') || '';

    const users = await prisma.user.findMany({
      where: {
        AND: [
          search ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          } : {},
        ],
      },
      include: {
        profile: true,
        assessments: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name || user.profile?.firstName + ' ' + user.profile?.lastName || 'Unknown',
      email: user.email,
      company: user.profile?.company || '',
      industry: user.profile?.industry || '',
      tier: user.profile?.cohortCode ? 'Cohort' : (user.assessments[0]?.tier || 'Free'),
      joinedAt: user.createdAt.toISOString().split('T')[0],
      lastActive: user.updatedAt.toISOString().split('T')[0],
      assessments: user.assessments.length,
    }));

    return NextResponse.json({ users: formattedUsers });
  } catch (error: any) {
    console.error('Admin users error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
