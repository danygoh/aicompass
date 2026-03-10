import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // Get the most recent assessment
    const assessment = await prisma.assessment.findFirst({
      orderBy: { completedAt: 'desc' },
      include: {
        profile: true,
        responses: {
          orderBy: { questionIndex: 'asc' }
        },
      },
    });

    if (!assessment) {
      return NextResponse.json({ assessment: null });
    }

    // Format the response
    const formattedAssessment = {
      id: assessment.id,
      profile: assessment.profile ? {
        firstName: assessment.profile.firstName,
        lastName: assessment.profile.lastName,
        email: null,
        jobTitle: assessment.profile.jobTitle,
        company: assessment.profile.company,
        industry: assessment.profile.industry,
        country: assessment.profile.country,
        seniority: assessment.profile.seniority,
        department: assessment.profile.department,
        cohortCode: assessment.profile.cohortCode,
      } : null,
      intelligence: assessment.intelligence || {},
      responses: assessment.responses.map(r => ({
        questionIndex: r.questionIndex,
        answer: r.answer,
        variant: r.variant,
      })),
      totalScore: assessment.totalScore,
      dimensionScores: assessment.dimensionScores || [],
      tier: assessment.tier,
      status: assessment.status,
      completedAt: assessment.completedAt,
    };

    return NextResponse.json({ assessment: formattedAssessment });
  } catch (error: any) {
    console.error('Error fetching latest assessment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assessment' },
      { status: 500 }
    );
  }
}
