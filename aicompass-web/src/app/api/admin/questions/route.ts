import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/admin/questions - List all questions
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const dimension = searchParams.get('dimension');
    const difficulty = searchParams.get('difficulty');
    const isActive = searchParams.get('isActive');
    const search = searchParams.get('search') || '';

    const where: any = {};

    if (dimension) where.dimension = parseInt(dimension);
    if (difficulty) where.difficulty = difficulty;
    if (isActive !== null) where.isActive = isActive === 'true';
    if (search) {
      where.OR = [
        { variants: { some: { questionText: { contains: search, mode: 'insensitive' } } } },
        { tags: { has: search } },
      ];
    }

    const questions = await prisma.question.findMany({
      where,
      include: {
        variants: true,
      },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json(questions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
  }
}

// POST /api/admin/questions - Create new question
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { dimension, difficulty, tags, isActive, order, variants } = body;

    // Validate required fields
    if (dimension === undefined || !variants || !Array.isArray(variants) || variants.length === 0) {
      return NextResponse.json({ error: 'Dimension and at least one variant required' }, { status: 400 });
    }

    // Create question with variants in a transaction
    const question = await prisma.question.create({
      data: {
        dimension,
        difficulty: difficulty || 'medium',
        tags: tags || [],
        isActive: isActive !== false,
        order: order || 0,
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

    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json({ error: 'Failed to create question' }, { status: 500 });
  }
}
