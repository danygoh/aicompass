import { Resend } from 'resend';

// Initialize Resend with API key
const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = 'AI Compass <noreply@ainativefoundation.org>';
const REPLY_TO = 'support@ainativefoundation.org';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send an email via Resend
 * Returns { success: true } or { success: false, error: string }
 */
export async function sendEmail({ to, subject, html }: SendEmailParams) {
  // Skip if no Resend key (development)
  if (!resend) {
    console.log('[Email] Resend not configured, skipping:', { to, subject });
    return { success: true, skipped: true };
  }

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      replyTo: REPLY_TO,
      to,
      subject,
      html,
    });

    if (result.error) {
      console.error('[Email] Resend error:', result.error);
      return { success: false, error: result.error.message };
    }

    console.log('[Email] Sent successfully:', { to, subject, id: result.data?.id });
    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error('[Email] Exception:', error);
    return { success: false, error: String(error) };
  }
}

// ============================================
// EMAIL TEMPLATES
// ============================================

/**
 * Welcome Email - sent when user completes profile
 */
export function getWelcomeEmailHTML(firstName: string, assessmentLink: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to AI Compass</title>
</head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;padding:40px 20px">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#1e293b;border-radius:12px;overflow:hidden">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#7c3aed,#3b82f6);padding:32px;text-align:center">
              <h1 style="margin:0;color:#fff;font-size:28px;font-weight:700">AI Compass</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px">AI Native Foundation</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:40px 32px;color:#e2e8f0">
              <h2 style="margin:0 0 24px;color:#fff;font-size:24px">Welcome${firstName ? `, ${firstName}` : ''}!</h2>
              <p style="margin:0 0 16px;font-size:16px;line-height:1.6">Welcome to AI Compass! You're about to begin your AI readiness assessment.</p>
              <p style="margin:0 0 24px;font-size:16px;line-height:1.6">This will take about 20 minutes and you'll receive a personalized 11-section report with actionable insights.</p>
              
              <h3 style="margin:0 0 12px;color:#fff;font-size:16px">What happens next:</h3>
              <ol style="margin:0 0 24px;padding-left:20px;line-height:1.8">
                <li>AI researches 12 intelligence sources about your context</li>
                <li>You validate the research data</li>
                <li>You answer 25 questions</li>
                <li>You get your report</li>
              </ol>
              
              <a href="${assessmentLink}" style="display:inline-block;background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:600;font-size:16px">Start Assessment →</a>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;background:rgba(0,0,0,0.2);text-align:center">
              <p style="margin:0;color:rgba(255,255,255,0.5);font-size:12px">© 2026 AI Native Foundation. All rights reserved.</p>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.4);font-size:11px">Company No. 15519232 · England and Wales</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Assessment Complete Email
 */
export function getAssessmentCompleteEmailHTML(
  firstName: string,
  score: number,
  tier: string,
  reportLink: string
) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Assessment Complete</title>
</head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;padding:40px 20px">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#1e293b;border-radius:12px;overflow:hidden">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#7c3aed,#3b82f6);padding:32px;text-align:center">
              <h1 style="margin:0;color:#fff;font-size:28px;font-weight:700">AI Compass</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px">Assessment Complete</p>
            </td>
          </tr>
          <!-- Score Card -->
          <tr>
            <td style="padding:40px 32px;text-align:center">
              <div style="display:inline-block;background:rgba(245,158,11,0.1);border:2px solid #f59e0b;border-radius:12px;padding:24px 48px">
                <p style="margin:0;color:rgba(255,255,255,0.7);font-size:14px">Your Score</p>
                <p style="margin:8px 0 0;color:#f59e0b;font-size:48px;font-weight:700">${score}</p>
                <p style="margin:8px 0 0;color:#fff;font-size:18px;font-weight:600">${tier}</p>
              </div>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:0 32px 40px;color:#e2e8f0">
              <p style="margin:0 0 16px;font-size:16px;line-height:1.6">Hi${firstName ? `, ${firstName}` : ''},</p>
              <p style="margin:0 0 16px;font-size:16px;line-height:1.6">Great news! You've completed your AI Compass assessment.</p>
              <p style="margin:0 0 24px;font-size:16px;line-height:1.6">Your detailed 11-section report is ready to view.</p>
              
              <a href="${reportLink}" style="display:inline-block;background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:600;font-size:16px">View Report →</a>
              
              <p style="margin:24px 0 0;color:rgba(255,255,255,0.6);font-size:14px">Not ready to purchase yet? No problem — your results are saved for 30 days.</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;background:rgba(0,0,0,0.2);text-align:center">
              <p style="margin:0;color:rgba(255,255,255,0.5);font-size:12px">© 2026 AI Native Foundation. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Report Ready Email (after payment)
 */
export function getReportReadyEmailHTML(
  firstName: string,
  score: number,
  tier: string,
  percentile: string,
  reportLink: string,
  pdfLink: string
) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Report is Ready</title>
</head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;padding:40px 20px">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#1e293b;border-radius:12px;overflow:hidden">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#f59e0b,#d97706);padding:32px;text-align:center">
              <h1 style="margin:0;color:#fff;font-size:28px;font-weight:700">🎉 Your Report is Ready!</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.9);font-size:14px">AI Compass</p>
            </td>
          </tr>
          <!-- Score Card -->
          <tr>
            <td style="padding:40px 32px;text-align:center">
              <div style="display:inline-block;background:rgba(245,158,11,0.1);border:2px solid #f59e0b;border-radius:12px;padding:24px 48px">
                <p style="margin:0;color:rgba(255,255,255,0.7);font-size:14px">Your Score</p>
                <p style="margin:8px 0 0;color:#f59e0b;font-size:48px;font-weight:700">${score}</p>
                <p style="margin:8px 0 0;color:#fff;font-size:18px;font-weight:600">${tier}</p>
                <p style="margin:8px 0 0;color:rgba(255,255,255,0.6);font-size:14px">${percentile} vs peers</p>
              </div>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:0 32px 40px;color:#e2e8f0">
              <p style="margin:0 0 16px;font-size:16px;line-height:1.6">Hi${firstName ? `, ${firstName}` : ''},</p>
              <p style="margin:0 0 16px;font-size:16px;line-height:1.6">Thank you for your purchase! Your full report is now available.</p>
              
              <h3 style="margin:0 0 12px;color:#fff;font-size:16px">Your report includes:</h3>
              <ul style="margin:0 0 24px;padding-left:20px;line-height:1.8;color:#e2e8f0">
                <li>Executive Summary</li>
                <li>5-Dimension Score Card</li>
                <li>Industry Benchmarks</li>
                <li>90-Day Roadmap</li>
                <li>And more...</li>
              </ul>
              
              <a href="${reportLink}" style="display:inline-block;background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:600;font-size:16px">View Report →</a>
              <br><br>
              <a href="${pdfLink}" style="display:inline-block;background:rgba(255,255,255,0.1);color:#f59e0b;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px">Download PDF ↓</a>
              
              <p style="margin:24px 0 0;color:rgba(255,255,255,0.6);font-size:14px">Questions? Reply to this email.</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;background:rgba(0,0,0,0.2);text-align:center">
              <p style="margin:0;color:rgba(255,255,255,0.5);font-size:12px">© 2026 AI Native Foundation. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Cohort Invite Email - sent when admin invites team members
 */
export function getCohortInviteEmailHTML(
  recipientName: string,
  adminName: string,
  companyName: string,
  cohortCode: string,
  assessmentLink: string
) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You've been invited!</title>
</head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;padding:40px 20px">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#1e293b;border-radius:12px;overflow:hidden">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#7c3aed,#3b82f6);padding:32px;text-align:center">
              <h1 style="margin:0;color:#fff;font-size:28px;font-weight:700">AI Compass</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px">You've been invited!</p>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding:40px 32px;color:#e2e8f0">
              <p style="margin:0 0 16px;font-size:16px;line-height:1.6">Hi${recipientName ? `, ${recipientName}` : ''},</p>
              <p style="margin:0 0 16px;font-size:16px;line-height:1.6"><strong>${adminName}</strong> at <strong>${companyName}</strong> has invited you to complete the AI Compass assessment.</p>
              
              <div style="background:rgba(245,158,11,0.1);border:2px solid #f59e0b;border-radius:12px;padding:24px;text-align:center;margin:24px 0">
                <p style="margin:0;color:rgba(255,255,255,0.7);font-size:14px">Your Access Code</p>
                <p style="margin:8px 0 0;color:#f59e0b;font-size:32px;font-weight:700;font-family:monospace">${cohortCode}</p>
              </div>
              
              <h3 style="margin:0 0 12px;color:#fff;font-size:16px">Why complete this assessment?</h3>
              <ul style="margin:0 0 24px;padding-left:20px;line-height:1.8">
                <li>Get personalized insights into your AI readiness</li>
                <li>Benchmark against peers in your industry</li>
                <li>Receive a comprehensive 11-section report</li>
                <li>${companyName} is tracking team AI readiness</li>
              </ul>
              
              <a href="${assessmentLink}" style="display:inline-block;background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:600;font-size:16px">Start Assessment →</a>
              
              <p style="margin:24px 0 0;color:rgba(255,255,255,0.6);font-size:14px">Questions? Contact ${adminName} or reply to this email.</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 32px;background:rgba(0,0,0,0.2);text-align:center">
              <p style="margin:0;color:rgba(255,255,255,0.5);font-size:12px">© 2026 AI Native Foundation. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
