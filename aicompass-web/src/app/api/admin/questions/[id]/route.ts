import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/admin/questions/[id] - Get single question
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        variants: true,
      },
    });

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    return NextResponse.json(question);
  } catch (error) {
    console.error('Error fetching question:', error);
    return NextResponse.json({ error: 'Failed to fetch question' }, { status: 500 });
  }
}

// PUT /api/admin/questions/[id] - Update question
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { dimension, difficulty, tags, isActive, order, variants } = body;

    // If updating variants, we need to delete old ones and create new
    if (variants) {
      // Delete existing variants
      await prisma.questionVariant.deleteMany({
        where: { questionId: id },
      });

      // Update question with new variants
      const question = await prisma.question.update({
        where: { id },
        data: {
          dimension: dimension,
          difficulty: difficulty,
          tags: tags,
          isActive: isActive,
          order: order,
          variants: {
            create: variants.map((v: any) => ({
              variantType: v.variantType,
              questionText: v.questionText,
              options: v.options,
              correctAnswer: v.correctAnswer || 0,
            })),
          },
        },
        include: {
          variants: true,
        },
      });

      return NextResponse.json(question);
    } else {
      // Just update question fields
      const question = await prisma.question.update({
        where: { id },
        data: {
          dimension,
          difficulty,
          tags,
          isActive,
          order,
        },
        include: {
          variants: true,
        },
      });

      return NextResponse.json(question);
    }
  } catch (error) {
    console.error('Error updating question:', error);
    return NextResponse.json({ error: 'Failed to update question' }, { status: 500 });
  }
}

// DELETE /api/admin/questions/[id] - Delete question (soft delete)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Soft delete - just set isActive to false
    const question = await prisma.question.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ message: 'Question archived', question });
  } catch (error) {
    console.error('Error deleting question:', error);
    return NextResponse.json({ error: 'Failed to delete question' }, { status: 500 });
  }
}
