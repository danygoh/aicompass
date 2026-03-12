import { NextResponse } from 'next/server';
import { generateWithFallback } from '@/lib/ai';

// Mock data as final fallback
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
      { fieldName: 'Performance Metrics', fieldValue: 'Leaders investing 5-10% of revenue in AI with clear ROI measurement frameworks.', source: 'Benchmarking' }
    ],
    sources: ['Benchmarking']
  },
  recentAIEvents: {
    name: 'recentAIEvents',
    fields: [
      { fieldName: 'Industry News', fieldValue: 'Major AI breakthroughs in generative models, automation, and enterprise adoption.', source: 'News Analysis' },
      { fieldName: 'Technology Advances', fieldValue: 'Emerging capabilities in multimodal AI, reasoning models, and autonomous systems.', source: 'News Analysis' }
    ],
    sources: ['News Analysis']
  },
  skillsCredentials: {
    name: 'skillsCredentials',
    fields: [
      { fieldName: 'Relevant Certifications', fieldValue: 'AWS Machine Learning, Google Cloud AI, Microsoft Azure AI certifications valued in industry.', source: 'Training Programs' },
      { fieldName: 'Training Programs', fieldValue: 'Executive AI programs at top business schools and specialized AI bootcamps.', source: 'Training Programs' }
    ],
    sources: ['Training Programs']
  }
};

// JSON repair function
function repairJSON(text: string): any {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  
  if (start === -1 || end === -1) return null;
  
  let cleaned = text.substring(start, end + 1);
  cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');
  cleaned = cleaned.replace(/([{,]\s*)(\w+)\s*:/g, '$1"$2":');
  cleaned = cleaned.replace(/:\s*'([^']*)'/g, ': "$1"');
  cleaned = cleaned.replace(/'([^']*?)'([,\s]*})/g, '"$1"$2');
  
  try {
    return JSON.parse(cleaned);
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, company, industry, jobTitle, seniority, department, country } = body;

    if (!company || !industry) {
      return NextResponse.json(
        { error: 'Company and industry are required' },
        { status: 400 }
      );
    }

    const prompt = `You are an expert AI analyst researching ${company}, a ${seniority || 'executive'} in the ${industry} industry operating in ${country || 'global'}.

Generate a comprehensive 12-category AI readiness intelligence report. Be thorough, specific, and actionable.

For each category, provide:
- name: The category identifier  
- fields: Array of {fieldName, fieldValue, source} where fieldValue provides 2-4 detailed sentences
- sources: Array of source names

CATEGORIES:
1. professionalProfile, 2. companyOverview, 3. companyAIPosture, 4. industryAILandscape, 5. regulatoryEnvironment, 6. countryAIPolicy, 7. competitiveIntelligence, 8. aiSkillsMarket, 9. technologyStack, 10. peerBenchmarks, 11. recentAIEvents, 12. skillsCredentials

Return valid JSON only.`;

    const text = await generateWithFallback(prompt);
    
    // Try direct parse
    let intelligence = null;
    try {
      intelligence = JSON.parse(text);
    } catch {
      intelligence = repairJSON(text);
    }
    
    if (!intelligence) {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        intelligence = repairJSON(match[0]);
      }
    }
    
    // If still failing, use mock data
    if (!intelligence) {
      console.log('Using mock data fallback');
      intelligence = MOCK_INTELLIGENCE;
    }
    
    return NextResponse.json(intelligence);
  } catch (error: any) {
    console.error('Intelligence error:', error);
    // Return mock data on any error
    return NextResponse.json(MOCK_INTELLIGENCE);
  }
}
