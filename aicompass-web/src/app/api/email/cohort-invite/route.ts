import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { sendEmail, getCohortInviteEmailHTML } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Require authentication
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { cohortId, emails, message } = body;

    if (!cohortId || !emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { error: 'Cohort ID and email addresses required' },
        { status: 400 }
      );
    }

    // Get cohort details
    const cohort = await prisma.cohort.findUnique({
      where: { id: cohortId },
    });

    if (!cohort) {
      return NextResponse.json({ error: 'Cohort not found' }, { status: 404 });
    }

    // Get admin name from session
    const adminName = (session.user as any)?.name || 'Admin';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9000';
    const assessmentLink = `${appUrl}/assess/profile`;

    // Send invite to each email
    const results = [];
    for (const email of emails) {
      const html = getCohortInviteEmailHTML(
        '', // recipient name - could be extracted from email if needed
        adminName,
        cohort.name,
        cohort.code,
        assessmentLink
      );

      const result = await sendEmail({
        to: email,
        subject: `You've been invited to ${cohort.name} AI Assessment`,
        html,
      });

      results.push({ email, success: result.success, error: result.error });
    }

    const successCount = results.filter(r => r.success).length;

    return NextResponse.json({
      success: true,
      message: `Sent ${successCount} of ${emails.length} invitations`,
      results,
    });
  } catch (error) {
    console.error('Cohort invite error:', error);
    return NextResponse.json(
      { error: 'Failed to send invitations' },
      { status: 500 }
    );
  }
}
