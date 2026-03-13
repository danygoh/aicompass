import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | AI Compass',
  description: 'AI Compass Privacy Policy - How we protect your data.',
};

export default function PrivacyPolicy() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px', fontFamily: 'system-ui, sans-serif', lineHeight: 1.7 }}>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>Privacy Policy</h1>
      <p style={{ color: '#666', marginBottom: 32 }}>Last updated: March 2026</p>

      <section style={{ marginBottom: 32 }}>
        <h2>1. Introduction</h2>
        <p>AI Compass ("we", "us", or "our") is operated by <strong>AI Native Foundation</strong>, a non-profit foundation registered in England and Wales (Company No. 15519232). We operate the AI Compass assessment platform (the "Product"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you complete our AI readiness assessment.</p>
        <p>By using AI Compass, you agree to the collection and use of information in accordance with this policy.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>2. Information We Collect</h2>
        <p>We collect information you provide directly:</p>
        <ul style={{ marginTop: 12, paddingLeft: 20 }}>
          <li><strong>Profile information:</strong> Name, email address, job title, company name</li>
          <li><strong>Professional details:</strong> Industry, country, seniority level, department</li>
          <li><strong>Assessment responses:</strong> Your answers to our 25-question AI readiness evaluation across 5 dimensions</li>
          <li><strong>Cohort codes:</strong> If provided by your organization for group access</li>
          <li><strong>Payment information:</strong> Processed securely through third-party payment providers (we do not store card details)</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>3. How We Use Your Information</h2>
        <p>We use your information to:</p>
        <ul style={{ marginTop: 12, paddingLeft: 20 }}>
          <li>Generate your personalized AI readiness report with tailored recommendations</li>
          <li>Provide benchmarking against industry peers and similar organizations</li>
          <li>Improve our assessment methodology based on aggregate insights</li>
          <li>Communicate with you about your assessment results</li>
          <li>Process payments for assessment access</li>
          <li>Administer cohort access for organizational customers</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>4. AI-Generated Content</h2>
        <p>AI Compass generates certain content using artificial intelligence (AI), including:</p>
        <ul style={{ marginTop: 12, paddingLeft: 20 }}>
          <li>Intelligence insights based on your inputs and industry data</li>
          <li>Personalized recommendations for AI adoption</li>
          <li>Comparative benchmarks and analysis</li>
        </ul>
        <p style={{ marginTop: 12 }}>While we strive for accuracy, AI-generated content may contain errors or inaccuracies. We recommend validating critical business decisions with additional sources. AI content is generated based on publicly available information and may not reflect your specific circumstances.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>5. Data Storage & Security</h2>
        <p><strong>Storage:</strong> Your data is stored securely using industry-standard encryption. We use PostgreSQL databases hosted by Neon Technologies with SSL encryption in transit and at rest.</p>
        <p style={{ marginTop: 12 }}><strong>Retention:</strong> Your assessment responses are stored indefinitely unless you request deletion. You may request deletion of your personal data at any time.</p>
        <p style={{ marginTop: 12 }}><strong>Security:</strong> We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>6. Data Sharing</h2>
        <p><strong>We do not sell your personal information.</strong></p>
        <p style={{ marginTop: 12 }}>We may share your data in the following circumstances:</p>
        <ul style={{ marginTop: 12, paddingLeft: 20 }}>
          <li><strong>Service providers:</strong> With third parties who provide services on our behalf (e.g., database hosting, payment processing)</li>
          <li><strong>Aggregated data:</strong> We may share anonymized, aggregated data for research and benchmarking purposes</li>
          <li><strong>Cohort administrators:</strong> If you access via an organizational cohort, aggregate statistics may be shared with your organization</li>
          <li><strong>Legal requirements:</strong> When required by law or in response to valid legal requests</li>
        </ul>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>7. Your Rights (GDPR)</h2>
        <p>Under the UK General Data Protection Regulation (UK GDPR), you have the following rights:</p>
        <ul style={{ marginTop: 12, paddingLeft: 20 }}>
          <li><strong>Right to access:</strong> Request a copy of your personal data</li>
          <li><strong>Right to rectification:</strong> Request correction of inaccurate personal data</li>
          <li><strong>Right to erasure:</strong> Request deletion of your personal data ("right to be forgotten")</li>
          <li><strong>Right to restrict processing:</strong> Request limitation on how we process your data</li>
          <li><strong>Right to data portability:</strong> Request your data in a machine-readable format</li>
          <li><strong>Right to object:</strong> Object to processing based on legitimate interests</li>
          <li><strong>Rights related to automated decision-making:</strong> You have the right not to be subject to decisions based solely on automated processing that significantly affect you</li>
        </ul>
        <p style={{ marginTop: 12 }}>To exercise any of these rights, contact us at <strong>danny@ainativefoundation.org</strong></p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>8. Cookies</h2>
        <p>We use cookies and similar tracking technologies to:</p>
        <ul style={{ marginTop: 12, paddingLeft: 20 }}>
          <li>Keep you logged in</li>
          <li>Understand how you use our platform</li>
          <li>Improve our services</li>
        </ul>
        <p style={{ marginTop: 12 }}>You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>9. Third-Party Links</h2>
        <p>Our platform may contain links to third-party websites, services, or applications. We are not responsible for the privacy practices of these third parties. We encourage you to review the privacy policies of any third-party sites you visit.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>10. Children's Privacy</h2>
        <p>AI Compass is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If you become aware that a child has provided us with personal data, please contact us.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>11. Changes to This Policy</h2>
        <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>12. Governing Law</h2>
        <p>This Privacy Policy is governed by and construed in accordance with the laws of England and Wales. Any disputes arising from this policy shall be subject to the exclusive jurisdiction of the courts of England and Wales.</p>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2>13. Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us:</p>
        <p style={{ marginTop: 12 }}><strong>Email:</strong> danny@ainativefoundation.org</p>
        <p><strong>Organization:</strong> AI Native Foundation</p>
        <p><strong>Company Number:</strong> 15519232 (England and Wales)</p>
        <p><strong>Registered Address:</strong> England and Wales</p>
      </section>
    </div>
  );
}
