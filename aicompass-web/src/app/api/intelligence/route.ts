import { NextResponse } from 'next/server';

// Simple mock data for testing
const MOCK_INTELLIGENCE = {
  professionalProfile: {
    name: 'professionalProfile',
    fields: [
      { fieldName: 'Executive Role', fieldValue: 'CEO leading strategic AI initiatives with full authority over technology investments and digital transformation.', source: 'Profile' },
      { fieldName: 'AI Involvement', fieldValue: 'Direct oversight of AI strategy, actively evaluating AI solutions for competitive advantage.', source: 'Profile' }
    ],
    sources: ['User Profile']
  },
  companyOverview: {
    name: 'companyOverview',
    fields: [
      { fieldName: 'Company Size', fieldValue: 'Large enterprise with established market presence and significant R&D capabilities.', source: 'Industry Analysis' },
      { fieldName: 'Strategic Position', fieldValue: 'Industry leader with strong brand recognition and global reach.', source: 'Industry Analysis' }
    ],
    sources: ['Industry Analysis']
  },
  companyAIPosture: {
    name: 'companyAIPosture',
    fields: [
      { fieldName: 'AI Strategy', fieldValue: 'Comprehensive AI roadmap with dedicated budget and cross-functional AI governance committee.', source: 'Company Assessment' },
      { fieldName: 'Current Initiatives', fieldValue: 'AI deployed in customer service, predictive analytics, process automation, and product enhancement.', source: 'Company Assessment' }
    ],
    sources: ['Company Assessment']
  },
  industryAILandscape: {
    name: 'industryAILandscape',
    fields: [
      { fieldName: 'AI Transformation', fieldValue: 'Leading AI adoption with generative AI, intelligent automation, and data-driven decision making.', source: 'Industry Research' },
      { fieldName: 'Key Trends', fieldValue: 'Focus on AI-powered product innovation, operational efficiency, and enhanced customer experiences.', source: 'Industry Research' }
    ],
    sources: ['Industry Research']
  },
  regulatoryEnvironment: {
    name: 'regulatoryEnvironment',
    fields: [
      { fieldName: 'AI Regulations', fieldValue: 'Proactive compliance with emerging AI regulations including data privacy and algorithmic accountability.', source: 'Regulatory Analysis' },
      { fieldName: 'Compliance Focus', fieldValue: 'Strong focus on data protection, fair lending, and responsible AI deployment.', source: 'Regulatory Analysis' }
    ],
    sources: ['Regulatory Analysis']
  },
  countryAIPolicy: {
    name: 'countryAIPolicy',
    fields: [
      { fieldName: 'National AI Strategy', fieldValue: 'USA leads in AI innovation with strong government support for research and development.', source: 'Government Policy' },
      { fieldName: 'Government Support', fieldValue: 'Significant investment in AI research, workforce development, and public-private partnerships.', source: 'Government Policy' }
    ],
    sources: ['Government Policy']
  },
  competitiveIntelligence: {
    name: 'competitiveIntelligence',
    fields: [
      { fieldName: 'Competitor AI Adoption', fieldValue: 'Leading competitors have achieved significant ROI through AI in customer experience and operations.', source: 'Market Analysis' },
      { fieldName: 'Differentiation', fieldValue: 'Opportunities in vertical AI solutions, ethical AI leadership, and AI-native product development.', source: 'Market Analysis' }
    ],
    sources: ['Market Analysis']
  },
  aiSkillsMarket: {
    name: 'aiSkillsMarket',
    fields: [
      { fieldName: 'Talent Availability', fieldValue: 'Strong talent pool with competitive compensation for AI/ML professionals.', source: 'Labor Market' },
      { fieldName: 'Skill Gaps', fieldValue: 'High demand for AI architects, ML engineers, and AI ethics specialists.', source: 'Labor Market' }
    ],
    sources: ['Labor Market']
  },
  technologyStack: {
    name: 'technologyStack',
    fields: [
      { fieldName: 'Infrastructure', fieldValue: 'Cloud-native architecture with scalable compute, robust data pipelines, and MLOps practices.', source: 'Technical Assessment' },
      { fieldName: 'AI Readiness', fieldValue: 'Well-positioned for AI deployment with strong data governance and integration capabilities.', source: 'Technical Assessment' }
    ],
    sources: ['Technical Assessment']
  },
  peerBenchmarks: {
    name: 'peerBenchmarks',
    fields: [
      { fieldName: 'Industry Leaders', fieldValue: 'Top performers achieving 30-50% efficiency gains and 20-40% customer satisfaction improvements.', source: 'Benchmarking' },
      { fieldName: 'Best Practices', fieldValue: 'Focus on business value, cross-functional teams, and iterative AI deployment.', source: 'Benchmarking' }
    ],
    sources: ['Benchmarking']
  },
  recentAIEvents: {
    name: 'recentAIEvents',
    fields: [
      { fieldName: 'Industry Developments', fieldValue: 'Breakthroughs in multimodal AI, enterprise AI platforms, and responsible AI tools.', source: 'News Analysis' },
      { fieldName: 'Technology Advances', fieldValue: 'Major advances in generative AI, AI agents, and natural language processing.', source: 'News Analysis' }
    ],
    sources: ['News Analysis']
  },
  skillsCredentials: {
    name: 'skillsCredentials',
    fields: [
      { fieldName: 'Recommended Certs', fieldValue: 'Google AI/ML, AWS Machine Learning, Microsoft AI Engineer, Stanford AI programs.', source: 'Training Market' },
      { fieldName: 'Executive Training', fieldValue: 'MIT, Stanford, and INSEAD offer strategic AI programs for senior leaders.', source: 'Training Market' }
    ],
    sources: ['Training Market']
  }
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Intelligence request received:', body);
    
    return NextResponse.json(MOCK_INTELLIGENCE);
  } catch (error: any) {
    console.error('Intelligence error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate intelligence' },
      { status: 500 }
    );
  }
}
