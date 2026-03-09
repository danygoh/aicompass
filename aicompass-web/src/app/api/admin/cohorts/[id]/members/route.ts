import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Get cohort with its members (via payments which link users to cohorts)
    const cohort = await prisma.cohort.findUnique({
      where: { id },
    });
    
    if (!cohort) {
      return NextResponse.json({ error: 'Cohort not found' }, { status: 404 });
    }
    
    // Get users in this cohort via payments
    const payments = await prisma.payment.findMany({
      where: { cohortId: id },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    
    const members = payments.map(p => ({
      id: p.user.id,
      name: p.user.name,
      email: p.user.email,
    }));
    
    return NextResponse.json({ members });
  } catch (error: any) {
    console.error('Cohort members error:', error);
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { userId } = await request.json();
    
    // Create a payment record to link user to cohort
    const payment = await prisma.payment.create({
      data: {
        userId,
        cohortId: id,
        amount: 0,
        status: 'PENDING',
        paymentMethod: 'cohort',
      },
    });
    
    return NextResponse.json({ success: true, payment });
  } catch (error: any) {
    console.error('Add member error:', error);
    return NextResponse.json({ error: 'Failed to add member' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }
    
    // Delete payment records linking user to cohort
    await prisma.payment.deleteMany({
      where: { cohortId: id, userId },
    });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Remove member error:', error);
    return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 });
  }
}
