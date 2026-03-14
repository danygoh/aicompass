'use client';

import Script from 'next/script';

interface StructuredDataProps {
  data: object;
}

export default function StructuredData({ data }: StructuredDataProps) {
  return (
    <Script
      id="json-ld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Organization Schema
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'AI Native Foundation',
  url: 'https://ainativefoundation.org',
  logo: 'https://aicompass.ainativefoundation.org/logo.png',
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'support@ainativefoundation.org',
    contactType: 'customer service',
  },
  sameAs: [
    'https://twitter.com/ainativefoundation',
    'https://linkedin.com/company/ainativefoundation',
  ],
};

// WebApplication Schema
export const webApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'AI Compass',
  description: 'AI readiness assessment that researches and validates intelligence about you and your organization before asking questions',
  url: 'https://aicompass.ainativefoundation.org',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web Browser',
  offers: {
    '@type': 'Offer',
    price: '199',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    reviewCount: '500',
  },
};

// AssessmentProduct Schema
export const assessmentProductSchema = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'AI Compass Professional Report',
  description: 'Comprehensive 11-section AI readiness report with peer benchmarks and 90-day roadmap',
  brand: {
    '@type': 'Brand',
    name: 'AI Native Foundation',
  },
  offers: {
    '@type': 'Offer',
    price: '199',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
  },
};
