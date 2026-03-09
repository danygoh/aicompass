import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // For now, allow anonymous assessments (optional auth)
    let userId = session ? (session.user as any).id : null;

    const body = await request.json();
    console.log('Save assessment request:', { userId, profile: body.profile?.company });
    
    const { 
      profile, 
      responses = [], 
      intelligence = {}, 
      totalScore, 
      dimensionScores = [], 
      tier = 'Progressive',
      reportId,
      reportData 
    } = body;

    // If no user session, create or get anonymous user
    if (!userId) {
      // Check if there's an anonymous user or create one
      const anonymousUser = await prisma.user.findFirst({
        where: { email: 'anonymous@aicompass.com' },
      });
      
      if (anonymousUser) {
        userId = anonymousUser.id;
      } else {
        const newUser = await prisma.user.create({
          data: {
            email: 'anonymous@aicompass.com',
            passwordHash: 'anonymous',
            name: 'Anonymous User',
          },
        });
        userId = newUser.id;
      }
    }

    // Create profile first, then assessment
    const profileData = await prisma.profile.upsert({
      where: { userId },
      update: {
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        jobTitle: profile.jobTitle || '',
        company: profile.company || '',
        industry: profile.industry || '',
        country: profile.country || '',
        seniority: profile.seniority || '',
        department: profile.department || '',
        cohortCode: profile.cohortCode || '',
      },
      create: {
        userId,
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        jobTitle: profile.jobTitle || '',
        company: profile.company || '',
        industry: profile.industry || '',
        country: profile.country || '',
        seniority: profile.seniority || '',
        department: profile.department || '',
        cohortCode: profile.cohortCode || '',
      },
    });

    // Create or update assessment
    let assessment;
    const existingAssessment = await prisma.assessment.findFirst({
      where: { profileId: profileData.id }
    });
    
    if (existingAssessment) {
      assessment = await prisma.assessment.update({
        where: { id: existingAssessment.id },
        data: {
          intelligence: intelligence || {},
          variants: responses.map(() => 'standard'),
          totalScore,
          dimensionScores,
          tier,
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });
    } else {
      assessment = await prisma.assessment.create({
        data: {
          userId,
          profileId: profileData.id,
          intelligence: intelligence || {},
          variants: responses.map(() => 'standard'),
          totalScore,
          dimensionScores,
          tier,
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });
    }

    // Create report if data provided
    if (reportData) {
      await prisma.report.create({
        data: {
          assessmentId: assessment.id,
          reportId: reportId || `AIC-${assessment.id.slice(0, 8)}`,
          reportData,
        },
      });
    }

    // Save responses (delete existing first)
    if (responses && responses.length > 0) {
      // Delete existing responses
      await prisma.response.deleteMany({
        where: { assessmentId: assessment.id }
      });
      
      await prisma.response.createMany({
        data: responses
          .map((answer: number, index: number) => ({
            assessmentId: assessment.id,
            questionIndex: index,
            answer,
            variant: 'standard',
          }))
          .filter((r: any) => r.answer !== null),
      });
    }

    return NextResponse.json({
      success: true,
      assessmentId: assessment.id,
      reportId: reportId || `AIC-${assessment.id.slice(0, 8)}`,
    });
  } catch (error: any) {
    console.error('Save assessment error:', error);
    return NextResponse.json(
      { error: 'Failed to save assessment' },
      { status: 500 }
    );
  }
}
