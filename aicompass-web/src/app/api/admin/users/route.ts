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
    const search = searchParams.get('search') || '';

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

    const formattedUsers = users.map(user => {
      const completedAssessment = user.assessments.find(a => a.status === 'COMPLETED');
      return {
        id: user.id,
        name: user.name || user.profile?.firstName + ' ' + user.profile?.lastName || 'Unknown',
        email: user.email,
        role: user.role,
        company: user.profile?.company || '',
        industry: user.profile?.industry || '',
        tier: user.profile?.cohortCode ? 'Cohort' : (completedAssessment?.tier || 'Free'),
        joinedAt: user.createdAt.toISOString(),
        lastLogin: user.updatedAt.toISOString(),
        lastActive: user.updatedAt.toISOString(),
        assessmentCount: user.assessments.length,
        lastCompletedAt: completedAssessment?.completedAt || null,
        lastScore: completedAssessment?.totalScore || null,
      };
    });

    return NextResponse.json({ users: formattedUsers });
  } catch (error: any) {
    console.error('Admin users error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, email, password, company, tier, role } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        role: role || 'USER',
        passwordHash,
        profile: {
          create: {
            firstName: name?.split(' ')[0] || '',
            lastName: name?.split(' ').slice(1).join(' ') || '',
            company: company || '',
          }
        }
      },
      include: { profile: true }
    });

    return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } });
  } catch (error: any) {
    console.error('Create user error:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
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
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Delete related records first
    await prisma.response.deleteMany({
      where: { assessment: { userId: id } }
    });
    await prisma.assessment.deleteMany({
      where: { userId: id }
    });
    await prisma.profile.deleteMany({
      where: { userId: id }
    });

    // Delete user
    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
