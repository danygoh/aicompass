import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

export async function GET() {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const cohorts = await prisma.cohort.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { payments: true }
        }
      }
    });
    
    // Get member counts for each cohort
    const cohortsWithMembers = await Promise.all(
      cohorts.map(async (cohort) => {
        const memberCount = await prisma.profile.count({
          where: { cohortCode: cohort.code }
        });
        return { ...cohort, memberCount };
      })
    );
    
    return NextResponse.json({ cohorts: cohortsWithMembers });
  } catch (error: any) {
    console.error('Cohorts API error:', error);
    return NextResponse.json({ error: 'Failed to fetch cohorts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const { name, code, organization, description, maxUsers } = body;

    const cohort = await prisma.cohort.create({
      data: {
        name,
        code: code.toUpperCase(),
        organization,
        description,
        maxUsers: maxUsers ? parseInt(maxUsers) : null,
      },
    });

    return NextResponse.json({ cohort });
  } catch (error: any) {
    console.error('Create cohort error:', error);
    return NextResponse.json({ error: 'Failed to create cohort' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const { id, name, code, organization, description, maxUsers, status } = body;

    const cohort = await prisma.cohort.update({
      where: { id },
      data: {
        name,
        code: code?.toUpperCase(),
        organization,
        description,
        maxUsers: maxUsers ? parseInt(maxUsers) : null,
        status,
      },
    });

    return NextResponse.json({ cohort });
  } catch (error: any) {
    console.error('Update cohort error:', error);
    return NextResponse.json({ error: 'Failed to update cohort' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing cohort ID' }, { status: 400 });
    }

    await prisma.cohort.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete cohort error:', error);
    return NextResponse.json({ error: 'Failed to delete cohort' }, { status: 500 });
  }
}
