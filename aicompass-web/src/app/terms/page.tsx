import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | AI Compass',
  description: 'AI Compass Terms of Service - Usage terms and conditions.',
};

export default function TermsOfService() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: 32, marginBottom: 24 }}>Terms of Service</h1>
      <p style={{ color: '#666', marginBottom: 32 }}>Last updated: March 2026</p>

      <section style={{ marginBottom: 32 }}>
        <h2>1. Acceptance of Terms</h2>
        <p>By accessing and using AI Compass, you accept and agree to be bound by the terms and provision of this agreement.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>2. Description of Service</h2>
        <p>AI Compass is an AI readiness assessment platform that provides:</p>
        <ul style={{ marginTop: 12, paddingLeft: 20 }}>
          <li>Personalized AI readiness evaluation</li>
          <li>Industry benchmarking analysis</li>
          <li>Strategic recommendations for AI adoption</li>
          <li>Educational resources and learning pathways</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>3. User Responsibilities</h2>
        <p>You agree to:</p>
        <ul style={{ marginTop: 12, paddingLeft: 20 }}>
          <li>Provide accurate and complete information</li>
          <li>Use the service for lawful purposes only</li>
          <li>Not attempt to gain unauthorized access to any part of the system</li>
          <li>Not copy, modify, or distribute our proprietary assessment content</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>4. Intellectual Property</h2>
        <p>The AI Compass assessment methodology, questions, and report templates are proprietary intellectual property of Nexus FrontierTech. Users may share their individual reports but may not reproduce, distribute, or create derivative works from our assessment content without written permission.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>5. Disclaimer of Warranties</h2>
        <p>THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. WE DO NOT GUARANTEE THAT THE ASSESSMENT WILL MEET YOUR REQUIREMENTS OR BE UNINTERRUPTED, SECURE, OR ERROR-FREE.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>6. Limitation of Liability</h2>
        <p>IN NO EVENT SHALL AI COMPASS OR NEXUS FRONTIERTECH BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF YOUR USE OF THE SERVICE.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>7. Payment & Refunds</h2>
        <p>Professional reports are sold as one-time purchases. If you encounter issues with your report, contact support within 30 days of purchase. We reserve the right to refuse refunds in cases of fraud or abuse.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>8. Termination</h2>
        <p>We may terminate or suspend access to our service immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users or us.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>9. Changes to Terms</h2>
        <p>We reserve the right to modify these terms at any time. Your continued use of the service after changes constitutes acceptance of the new terms.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>10. Contact</h2>
        <p>For questions about these terms, contact us at:</p>
        <p style={{ marginTop: 12 }}><strong>Email:</strong> legal@aicompass.ai</p>
        <p><strong>Organization:</strong> Nexus FrontierTech</p>
      </section>
    </div>
  );
}
