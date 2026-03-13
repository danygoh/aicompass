import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { CohortValidateSchema } from '@/lib/validations';

// Public endpoint to validate cohort code
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    // Validate with Zod
    const validation = CohortValidateSchema.safeParse({ code });
    if (!validation.success || !validation.data.code) {
      return NextResponse.json({ valid: false, error: 'Invalid code' }, { status: 400 });
    }

    const cohort = await prisma.cohort.findFirst({
      where: {
        code: validation.data.code.toUpperCase(),
        status: 'ACTIVE',
      },
    });

    if (!cohort) {
      return NextResponse.json({ valid: false, error: 'Invalid code' });
    }

    // Count users with this cohort code
    const usedCount = await prisma.profile.count({
      where: { cohortCode: cohort.code },
    });

    // Check max users limit
    if (cohort.maxUsers && usedCount >= cohort.maxUsers) {
      return NextResponse.json({ 
        valid: false, 
        error: `Cohort limit reached (${cohort.maxUsers} users maximum). Please contact your administrator.` 
      });
    }

    return NextResponse.json({ 
      valid: true, 
      cohort: {
        code: cohort.code,
        name: cohort.name,
        organization: cohort.organization,
        maxUsers: cohort.maxUsers,
        used: usedCount,
      }
    });
  } catch (error) {
    console.error('Cohort validation error:', error);
    return NextResponse.json({ valid: false, error: 'Validation failed' }, { status: 500 });
  }
}
