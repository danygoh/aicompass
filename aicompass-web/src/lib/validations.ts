import { z } from 'zod';

// Profile validation schema
export const ProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email address'),
  jobTitle: z.string().max(100).optional(),
  company: z.string().max(200).optional(),
  industry: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  seniority: z.string().max(50).optional(),
  department: z.string().max(100).optional(),
  cohortCode: z.string().max(50).optional(),
});

// Dimension score schema
const DimensionScoreSchema = z.object({
  dimension: z.string(),
  score: z.number().min(0).max(20),
});

// Assessment save validation schema
export const AssessmentSaveSchema = z.object({
  profile: ProfileSchema,
  responses: z.array(z.number().min(1).max(5)).length(25, 'Must answer all 25 questions'),
  totalScore: z.number().min(0).max(100),
  tier: z.string().max(50),
  dimensionScores: z.array(DimensionScoreSchema).optional(),
});

// Cohort validate schema
export const CohortValidateSchema = z.object({
  code: z.string().min(1, 'Cohort code is required').max(50),
});

// Cohort invite schema
export const CohortInviteSchema = z.object({
  cohortId: z.string().min(1, 'Cohort ID is required'),
  emails: z.array(z.string().email()).min(1, 'At least one email required'),
  message: z.string().max(500).optional(),
});

// Payment webhook schema (for future use)
export const PaymentWebhookSchema = z.object({
  eventId: z.string(),
  eventType: z.string(),
  paymentId: z.string(),
  amount: z.number().positive(),
  currency: z.string().length(3),
  status: z.enum(['completed', 'failed', 'pending']),
  customerEmail: z.string().email(),
});
