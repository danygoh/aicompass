import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | AI Compass',
  description: 'AI Compass Privacy Policy - How we protect your data.',
};

export default function PrivacyPolicy() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: 32, marginBottom: 24 }}>Privacy Policy</h1>
      <p style={{ color: '#666', marginBottom: 32 }}>Last updated: March 2026</p>

      <section style={{ marginBottom: 32 }}>
        <h2>1. Introduction</h2>
        <p>AI Compass ("we", "us", or "our") operates the AI Compass assessment platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you complete our AI readiness assessment.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>2. Information We Collect</h2>
        <p>We collect information you provide directly:</p>
        <ul style={{ marginTop: 12, paddingLeft: 20 }}>
          <li>Profile information (name, email, job title, company)</li>
          <li>Professional details (industry, country, seniority, department)</li>
          <li>Assessment responses to our 25-question AI readiness evaluation</li>
          <li>Cohort codes if provided by your organization</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>3. How We Use Your Information</h2>
        <p>We use your information to:</p>
        <ul style={{ marginTop: 12, paddingLeft: 20 }}>
          <li>Generate your personalized AI readiness report</li>
          <li>Provide benchmarking against industry peers</li>
          <li>Improve our assessment methodology</li>
          <li>Communicate with you about your assessment results</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>4. Data Storage & Security</h2>
        <p>Your data is stored securely using industry-standard encryption. We use PostgreSQL databases hosted by Neon Technologies with SSL encryption in transit. Your assessment responses are stored indefinitely unless you request deletion.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>5. Data Sharing</h2>
        <p>We do not sell your personal information. We may share aggregated, anonymized data for research purposes. If you belong to a cohort (e.g., corporate training program), your organization may receive aggregate statistics but not your individual responses.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>6. Your Rights</h2>
        <p>You have the right to:</p>
        <ul style={{ marginTop: 12, paddingLeft: 20 }}>
          <li>Access your personal data</li>
          <li>Request correction of your data</li>
          <li>Request deletion of your data</li>
          <li>Opt-out of marketing communications</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>7. Contact Us</h2>
        <p>For privacy concerns, contact us at:</p>
        <p style={{ marginTop: 12 }}><strong>Email:</strong> privacy@aicompass.ai</p>
        <p><strong>Organization:</strong> Nexus FrontierTech</p>
      </section>
    </div>
  );
}
