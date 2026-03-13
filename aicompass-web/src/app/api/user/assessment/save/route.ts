import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { sendEmail, getWelcomeEmailHTML, getAssessmentCompleteEmailHTML, getCohortInviteEmailHTML } from '@/lib/email';

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

    // If no user session, use profile email to find or create user
    if (!userId) {
      const profileEmail = profile?.email;
      
      if (profileEmail) {
        // Check if user exists with this email
        let existingUser = await prisma.user.findUnique({
          where: { email: profileEmail },
        });
        
        if (existingUser) {
          userId = existingUser.id;
        } else {
          // Create new user from profile
          const newUser = await prisma.user.create({
            data: {
              email: profileEmail,
              name: `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'New User',
              passwordHash: 'pending-registration', // User needs to set password
            },
          });
          userId = newUser.id;
        }
      } else {
        // No email - use or create anonymous user
        let anonymousUser = await prisma.user.findFirst({
          where: { email: 'anonymous@aicompass.com' },
        });
        
        if (!anonymousUser) {
          anonymousUser = await prisma.user.create({
            data: {
              email: 'anonymous@aicompass.com',
              passwordHash: 'anonymous',
              name: 'Anonymous User',
            },
          });
        }
        userId = anonymousUser.id;
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

    // ========================================
    // EMAIL NOTIFICATIONS
    // ========================================
    
    const userEmail = profile?.email;
    const firstName = profile?.firstName || '';
    const cohortCode = profile?.cohortCode || '';
    const profileEmail = profile?.email;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9000';

    // 1. Welcome email - if this is a new user (we created them in this request)
    const isNewUserFromThisRequest = !session && profileEmail;
    if (isNewUserFromThisRequest && userEmail) {
      const welcomeHtml = getWelcomeEmailHTML(
        firstName,
        `${appUrl}/assess/collect`
      );
      await sendEmail({
        to: userEmail,
        subject: `Welcome to AI Compass${firstName ? `, ${firstName}` : ''}!`,
        html: welcomeHtml,
      });
      console.log('[Email] Welcome email sent to:', userEmail);
    }

    // 2. Assessment Complete email - if responses submitted
    if (responses && responses.length > 0 && userEmail) {
      const assessmentCompleteHtml = getAssessmentCompleteEmailHTML(
        firstName,
        totalScore || 0,
        tier,
        `${appUrl}/assess/report/${assessment.id}`
      );
      await sendEmail({
        to: userEmail,
        subject: 'Assessment Complete - Your Report is Ready!',
        html: assessmentCompleteHtml,
      });
      console.log('[Email] Assessment complete email sent to:', userEmail);
    }

    // 3. Cohort Confirmed email - if user joined via cohort
    if (cohortCode && userEmail) {
      // Get cohort details
      const cohort = await prisma.cohort.findUnique({
        where: { code: cohortCode },
      });
      
      if (cohort) {
        const cohortInviteHtml = getCohortInviteEmailHTML(
          firstName,
          'Your Organization',
          cohort.name,
          cohortCode,
          `${appUrl}/assess/report/${assessment.id}`
        );
        await sendEmail({
          to: userEmail,
          subject: `You're in! ${cohort.name} AI Assessment`,
          html: cohortInviteHtml,
        });
        console.log('[Email] Cohort confirmed email sent to:', userEmail);
      }
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
