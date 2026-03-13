// Static fallback data for when AI fails
// Generic AI readiness insights that are still useful

interface IntelligenceField {
  fieldName: string;
  fieldValue: string;
  source: string;
}

interface IntelligenceCategory {
  name: string;
  fields: IntelligenceField[];
  sources: string[];
}

type IntelligenceData = Record<string, IntelligenceCategory>;

export const FALLBACK_INTELLIGENCE: IntelligenceData = {
  professionalProfile: {
    name: 'professionalProfile',
    fields: [{ fieldName: 'Summary', fieldValue: 'AI adoption depends on leadership commitment, available resources, and organizational readiness. Continuous learning is essential for staying current with AI developments.', source: 'General Best Practices' }],
    sources: ['Industry Standards']
  },
  companyOverview: {
    name: 'companyOverview',
    fields: [{ fieldName: 'Summary', fieldValue: 'Most organizations are in early stages of AI adoption. Focus on identifying high-impact use cases and building foundational capabilities first.', source: 'Industry Reports' }],
    sources: ['McKinsey', 'Gartner']
  },
  companyAIPosture: {
    name: 'companyAIPosture',
    fields: [{ fieldName: 'Summary', fieldValue: 'Start with pilot projects to demonstrate value, then scale based on results. Key success factors: executive sponsorship, clear use cases, and data readiness.', source: 'Best Practices' }],
    sources: ['Industry Standards']
  },
  industryAILandscape: {
    name: 'industryAILandscape',
    fields: [{ fieldName: 'Summary', fieldValue: 'Financial services, healthcare, and manufacturing lead in AI adoption. Retail and education are rapidly catching up. Key trends: automation, personalization, and predictive analytics.', source: 'Industry Reports' }],
    sources: ['Gartner', 'Forrester']
  },
  regulatoryEnvironment: {
    name: 'regulatoryEnvironment',
    fields: [{ fieldName: 'Summary', fieldValue: 'AI regulation is evolving globally. Key frameworks: EU AI Act, US Executive Order on AI. Focus on transparency, accountability, and fairness in AI systems.', source: 'Regulatory Updates' }],
    sources: ['EU AI Act', 'US Policy']
  },
  countryAIPolicy: {
    name: 'countryAIPolicy',
    fields: [{ fieldName: 'Summary', fieldValue: 'Most countries have national AI strategies. Key focus areas: research investment, skills development, and ethical AI frameworks. Check your local regulations.', source: 'Government Reports' }],
    sources: ['National AI Strategies']
  },
  competitiveIntelligence: {
    name: 'competitiveIntelligence',
    fields: [{ fieldName: 'Summary', fieldValue: 'Competitors are likely exploring AI in similar areas. Focus on unique value propositions and proprietary data advantages. Collaborate with partners for capabilities you lack.', source: 'Market Analysis' }],
    sources: ['Industry Analysis']
  },
  aiSkillsMarket: {
    name: 'aiSkillsMarket',
    fields: [{ fieldName: 'Summary', fieldValue: 'AI talent is in high demand. Consider upskilling existing staff, partnerships with AI providers, and flexible talent strategies.', source: 'Job Market Reports' }],
    sources: ['LinkedIn', 'World Economic Forum']
  },
  technologyStack: {
    name: 'technologyStack',
    fields: [{ fieldName: 'Summary', fieldValue: 'Cloud platforms offer comprehensive AI services. Start with managed services to reduce complexity. Consider open-source for customization.', source: 'Technology Analysts' }],
    sources: ['Gartner', 'Forrester']
  },
  peerBenchmarks: {
    name: 'peerBenchmarks',
    fields: [{ fieldName: 'Summary', fieldValue: 'Peer organizations typically achieve ROI in 12-18 months for successful AI projects. Focus on clear business outcomes and measure progress regularly.', source: 'Benchmarking Studies' }],
    sources: ['Industry Surveys']
  },
  recentAIEvents: {
    name: 'recentAIEvents',
    fields: [{ fieldName: 'Summary', fieldValue: 'Key developments: generative AI expansion, increased regulation, focus on responsible AI, and AI agent platforms emerging. Stay informed through industry publications.', source: 'News Analysis' }],
    sources: ['AI News']
  },
  skillsCredentials: {
    name: 'skillsCredentials',
    fields: [{ fieldName: 'Summary', fieldValue: 'Relevant certifications available from major cloud providers. Build internal capability through structured learning programs.', source: 'Education Providers' }],
    sources: ['Coursera', 'edX', 'Industry Certs']
  }
};

export function getFallbackIntelligence(company?: string): IntelligenceData {
  // Return copy of fallback with company name injected if provided
  const fallback: IntelligenceData = {};
  const companyStr = company ? ` for ${company}` : '';
  
  for (const [key, value] of Object.entries(FALLBACK_INTELLIGENCE)) {
    fallback[key] = {
      name: value.name,
      fields: [{
        fieldName: value.fields[0].fieldName,
        fieldValue: value.fields[0].fieldValue + companyStr,
        source: value.fields[0].source
      }],
      sources: [...value.sources]
    };
  }
  return fallback;
}
