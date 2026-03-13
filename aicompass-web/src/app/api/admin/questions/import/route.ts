import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// POST /api/admin/questions/import - Bulk import from CSV
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { questions } = body;

    if (!questions || !Array.isArray(questions)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    const results = { created: 0, errors: [] as string[] };

    for (const q of questions) {
      try {
        await prisma.question.create({
          data: {
            dimension: parseInt(q.dimension) || 0,
            difficulty: q.difficulty || 'medium',
            tags: q.tags ? q.tags.split(',').map((t: string) => t.trim()) : [],
            isActive: true,
            order: parseInt(q.question_num) || 0,
            variants: {
              create: [
                {
                  variantType: 'standard',
                  questionText: q.standard_question || q.question || '',
                  options: [
                    q.option_a || '',
                    q.option_b || '',
                    q.option_c || '',
                    q.option_d || ''
                  ]
                },
                {
                  variantType: 'stretch',
                  questionText: q.stretch_question || '',
                  options: [
                    q.stretch_a || q.option_a || '',
                    q.stretch_b || q.option_b || '',
                    q.stretch_c || q.option_c || '',
                    q.stretch_d || q.option_d || ''
                  ]
                },
                {
                  variantType: 'diagnostic',
                  questionText: q.diagnostic_question || '',
                  options: [
                    q.diagnostic_a || q.option_a || '',
                    q.diagnostic_b || q.option_b || '',
                    q.diagnostic_c || q.option_c || '',
                    q.diagnostic_d || q.option_d || ''
                  ]
                }
              ]
            }
          }
        });
        results.created++;
      } catch (err: any) {
        results.errors.push(`Question ${q.question_num}: ${err.message}`);
      }
    }

    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
