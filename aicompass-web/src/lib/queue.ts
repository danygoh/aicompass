import { Redis } from '@upstash/redis';
import { sendEmail, getWelcomeEmailHTML, getAssessmentCompleteEmailHTML, getReportReadyEmailHTML, getCohortInviteEmailHTML } from './email';

// Initialize Redis client
let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;
  
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return redis;
}

export type JobType = 'welcome_email' | 'assessment_complete_email' | 'report_ready_email' | 'cohort_invite_email' | 'generate_pdf';

export interface Job {
  id: string;
  type: JobType;
  data: any;
  createdAt: number;
}

/**
 * Add a job to the queue
 */
export async function addJob(type: JobType, data: any): Promise<string | null> {
  const client = getRedis();
  if (!client) {
    console.log('[Queue] Redis not configured, skipping job:', type);
    return null;
  }

  const job: Job = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    data,
    createdAt: Date.now(),
  };

  await client.lpush('aicompass:jobs:queue', JSON.stringify(job));
  console.log('[Queue] Job added:', job.id, job.type);
  
  return job.id;
}

/**
 * Process a single job
 */
async function processJob(job: Job): Promise<boolean> {
  console.log('[Queue] Processing job:', job.id, job.type);
  
  try {
    switch (job.type) {
      case 'welcome_email': {
        const { email, firstName, assessmentLink } = job.data;
        const html = getWelcomeEmailHTML(firstName, assessmentLink);
        await sendEmail({
          to: email,
          subject: `Welcome to AI Compass${firstName ? `, ${firstName}` : ''}!`,
          html,
        });
        console.log('[Queue] Welcome email sent to:', email);
        break;
      }
      
      case 'assessment_complete_email': {
        const { email, firstName, score, tier, reportLink } = job.data;
        const html = getAssessmentCompleteEmailHTML(firstName, score, tier, reportLink);
        await sendEmail({
          to: email,
          subject: 'Assessment Complete - Your Report is Ready!',
          html,
        });
        console.log('[Queue] Assessment complete email sent to:', email);
        break;
      }
      
      case 'report_ready_email': {
        const { email, firstName, score, tier, percentile, reportLink, pdfLink } = job.data;
        const html = getReportReadyEmailHTML(firstName, score, tier, percentile, reportLink, pdfLink);
        await sendEmail({
          to: email,
          subject: 'Your AI Compass Report is Ready! 📊',
          html,
        });
        console.log('[Queue] Report ready email sent to:', email);
        break;
      }
      
      case 'cohort_invite_email': {
        const { email, recipientName, adminName, companyName, cohortCode, assessmentLink } = job.data;
        const html = getCohortInviteEmailHTML(recipientName, adminName, companyName, cohortCode, assessmentLink);
        await sendEmail({
          to: email,
          subject: `You've been invited to ${companyName} AI Assessment`,
          html,
        });
        console.log('[Queue] Cohort invite email sent to:', email);
        break;
      }
      
      case 'generate_pdf': {
        // PDF generation would go here
        console.log('[Queue] PDF generation job:', job.id);
        break;
      }
      
      default:
        console.log('[Queue] Unknown job type:', job.type);
    }
    
    return true;
  } catch (error) {
    console.error('[Queue] Job processing error:', error);
    return false;
  }
}

/**
 * Process all pending jobs in the queue
 * This would typically be called by a cron job or worker
 */
export async function processQueue(): Promise<{ processed: number; failed: number }> {
  const client = getRedis();
  if (!client) {
    console.log('[Queue] Redis not configured, skipping queue processing');
    return { processed: 0, failed: 0 };
  }

  let processed = 0;
  let failed = 0;

  while (true) {
    const jobData = await client.rpop('aicompass:jobs:queue');
    if (!jobData) break;
    
    try {
      const job: Job = JSON.parse(jobData as string);
      const success = await processJob(job);
      if (success) {
        processed++;
      } else {
        failed++;
        // Re-queue failed jobs
        await client.lpush('aicompass:jobs:failed', jobData);
      }
    } catch (error) {
      console.error('[Queue] Failed to parse job:', error);
      failed++;
    }
  }

  console.log('[Queue] Processed:', processed, 'Failed:', failed);
  return { processed, failed };
}

/**
 * Check if queue is available
 */
export function isQueueAvailable(): boolean {
  return getRedis() !== null;
}
