import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | AI Compass',
  description: 'AI Compass Terms of Service - Usage terms and conditions.',
};

export default function TermsOfService() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui, sans-serif', lineHeight: 1.7 }}>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>Terms of Service</h1>
      <p style={{ color: '#666', marginBottom: 32 }}>Last updated: March 2026</p>

      <section style={{ marginBottom: 32 }}>
        <h2>1. Acceptance of Terms</h2>
        <p>By accessing and using <strong>AI Compass</strong> (the "Product"), provided by <strong>AI Native Foundation</strong> ("we", "us", or "our"), a non-profit foundation registered in England and Wales (Company No. 15519232), you accept and agree to be bound by these Terms of Service ("Terms").</p>
        <p>If you do not agree to these Terms, please do not use our service.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>2. Description of Service</h2>
        <p>AI Compass is an AI readiness assessment platform that provides:</p>
        <ul style={{ marginTop: 12, paddingLeft: 20 }}>
          <li>Personalized AI readiness evaluation (25 questions across 5 dimensions)</li>
          <li>Industry benchmarking analysis</li>
          <li>Strategic recommendations for AI adoption</li>
          <li>Intelligence insights powered by AI</li>
          <li>PDF report generation</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>3. User Eligibility</h2>
        <p>You must be at least 18 years old to use this service. By using AI Compass, you represent and warrant that you are at least 18 years old and have the legal capacity to enter into these Terms.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>4. User Responsibilities</h2>
        <p>You agree to:</p>
        <ul style={{ marginTop: 12, paddingLeft: 20 }}>
          <li>Provide accurate and complete information during registration and assessment</li>
          <li>Use the service for lawful purposes only</li>
          <li>Not attempt to gain unauthorized access to any part of the system</li>
          <li>Not copy, modify, or distribute our proprietary assessment content without permission</li>
          <li>Not use the service in any way that could damage, disable, or impair its operation</li>
          <li>Not attempt to reverse engineer or extract the methodology behind our assessments</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>5. Account Registration</h2>
        <p>When you create an account, you agree to:</p>
        <ul style={{ marginTop: 12, paddingLeft: 20 }}>
          <li>Provide accurate and current information</li>
          <li>Maintain the security of your account credentials</li>
          <li>Promptly update any changes to your information</li>
          <li>Accept responsibility for all activities under your account</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>6. Intellectual Property</h2>
        <p><strong>Ownership:</strong> The AI Compass assessment methodology, questions, report templates, algorithms, and all proprietary content are intellectual property of <strong>AI Native Foundation</strong>.</p>
        <p style={{ marginTop: 12 }}><strong>Your Report:</strong> You may share your individual assessment report within your organization. However, you may not reproduce, distribute, modify, or create derivative works from our assessment content without prior written permission.</p>
        <p style={{ marginTop: 12 }}><strong>Restrictions:</strong> You may not use our assessment questions, methodology, or content for commercial purposes without authorization.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>7. AI-Generated Content</h2>
        <p>AI Compass uses artificial intelligence to generate certain content, including:</p>
        <ul style={{ marginTop: 12, paddingLeft: 20 }}>
          <li>Intelligence insights and analysis</li>
          <li>Personalized recommendations</li>
          <li>Benchmarking comparisons</li>
        </ul>
        <p style={{ marginTop: 12 }}><strong>Important:</strong> While we strive for accuracy, AI-generated content may contain errors, inaccuracies, or outdated information. You should:</p>
        <ul style={{ marginTop: 12, paddingLeft: 20 }}>
          <li>Validate critical business decisions with additional sources</li>
          <li>Not rely solely on AI-generated content for strategic decisions</li>
          <li>Exercise professional judgment when using our insights</li>
        </ul>
        <p style={{ marginTop: 12 }}>We do not guarantee the accuracy, completeness, or reliability of AI-generated content.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>8. Payment & Pricing</h2>
        <p><strong>Pricing:</strong></p>
        <ul style={{ marginTop: 12, paddingLeft: 20 }}>
          <li>Professional Assessment: $199 (one-time payment)</li>
          <li>Team/Cohort: $149 per participant (minimum 10 participants)</li>
        </ul>
        <p style={{ marginTop: 12 }}><strong>Payment Terms:</strong> All payments are processed through secure third-party payment providers. By making a payment, you agree to the terms of the payment processor.</p>
        <p style={{ marginTop: 12 }}><strong>Refunds:</strong> If you encounter issues with your assessment or report, contact us within <strong>30 days</strong> of purchase. We reserve the right to refuse refunds in cases of fraud or abuse.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>9. Disclaimer of Warranties</h2>
        <p><strong>THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED.</strong></p>
        <p style={{ marginTop: 12 }}>WE DO NOT GUARANTEE THAT:</p>
        <ul style={{ marginTop: 12, paddingLeft: 20 }}>
          <li>THE ASSESSMENT WILL MEET YOUR REQUIREMENTS</li>
          <li>THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE</li>
          <li>THE RESULTS OBTAINED FROM USE OF THE SERVICE WILL BE ACCURATE OR RELIABLE</li>
          <li>ANY ERRORS IN THE SERVICE WILL BE CORRECTED</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>10. Limitation of Liability</h2>
        <p><strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW:</strong></p>
        <p style={{ marginTop: 12 }}>IN NO EVENT SHALL AI NATIVE FOUNDATION, ITS OFFICERS, DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:</p>
        <ul style={{ marginTop: 12, paddingLeft: 20 }}>
          <li>YOUR USE OR INABILITY TO USE THE SERVICE</li>
          <li>ANY UNAUTHORIZED ACCESS TO OR USE OF OUR SERVERS</li>
          <li>ANY INTERRUPTION OR CESSATION OF TRANSMISSION TO OR FROM THE SERVICE</li>
          <li>ANY BUGS, VIRUSES, OR THE LIKE THAT MAY BE TRANSMITTED TO OR THROUGH THE SERVICE</li>
          <li>ANY ERRORS OR OMISSIONS IN ANY CONTENT</li>
          <li>AI-GENERATED CONTENT OR DECISIONS MADE BASED ON AI COMPASS OUTPUTS</li>
        </ul>
        <p style={{ marginTop: 12 }}><strong>Our total liability shall not exceed the amount paid by you for the service.</strong></p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>11. Indemnification</h2>
        <p>You agree to indemnify, defend, and hold harmless AI Native Foundation and its officers, directors, employees, and agents from and against any and all claims, damages, losses, liabilities, costs, or expenses (including reasonable legal fees) arising out of or relating to:</p>
        <ul style={{ marginTop: 12, paddingLeft: 20 }}>
          <li>Your use of the service</li>
          <li>Your violation of these Terms</li>
          <li>Your violation of any third-party rights</li>
          <li>Content you submit to the service</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>12. Termination</h2>
        <p>We may terminate or suspend your account and access to the service immediately, without prior notice or liability, for conduct that we believe:</p>
        <ul style={{ marginTop: 12, paddingLeft: 20 }}>
          <li>Violates these Terms</li>
          <li>Is harmful to other users or us</li>
          <li>Is illegal or fraudulent</li>
        </ul>
        <p style={{ marginTop: 12 }}>Upon termination, your right to use the service will immediately cease.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>13. Governing Law</h2>
        <p>These Terms shall be governed by and construed in accordance with the laws of <strong>England and Wales</strong>. Any disputes arising from or relating to these Terms or your use of the service shall be subject to the <strong>exclusive jurisdiction of the courts of England and Wales</strong>.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>14. Changes to Terms</h2>
        <p>We reserve the right to modify these Terms at any time. We will provide notice of material changes by:</p>
        <ul style={{ marginTop: 12, paddingLeft: 20 }}>
          <li>Posting the updated Terms on our website</li>
          <li>Notifying you via email (if you have an account)</li>
        </ul>
        <p style={{ marginTop: 12 }}>Your continued use of the service after changes constitute acceptance of the new Terms. If you do not agree to the new Terms, please stop using the service.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>15. Severability</h2>
        <p>If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary so that these Terms shall otherwise remain in full force and effect.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>16. Entire Agreement</h2>
        <p>These Terms constitute the entire agreement between you and AI Native Foundation regarding your use of the service and supersede all prior agreements, understandings, or representations.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>17. Contact Information</h2>
        <p>If you have any questions about these Terms, please contact us:</p>
        <p style={{ marginTop: 12 }}><strong>Email:</strong> support@ainativefoundation.org</p>
        <p><strong>Organization:</strong> AI Native Foundation</p>
        <p><strong>Company Number:</strong> 15519232 (England and Wales)</p>
      </section>
    </div>
  );
}
