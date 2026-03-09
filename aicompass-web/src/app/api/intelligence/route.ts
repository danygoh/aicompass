import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const INDUSTRY_CONTEXT: Record<string, string> = {
  'Financial Services': 'You are an expert in financial services AI adoption. Consider banking, insurance, wealth management, and fintech.',
  'Technology': 'You are an expert in technology sector AI adoption. Consider software, SaaS, hardware, and tech services.',
  'Healthcare & Life Sciences': 'You are an expert in healthcare AI. Consider pharma, biotech, medical devices, and healthcare delivery.',
  'Professional Services': 'You are an expert in professional services AI. Consider consulting, legal, accounting, and advisory.',
  'Energy & Resources': 'You are an expert in energy sector AI. Consider oil & gas, renewables, utilities, and mining.',
  'Manufacturing': 'You are an expert in manufacturing AI. Consider industrial, automotive, aerospace, and supply chain.',
  'Government & Public Sector': 'You are an expert in government AI adoption. Consider federal, state, local, and public services.',
  'Education': 'You are an expert in education AI. Consider K-12, higher ed, edtech, and corporate training.',
  'Retail & Consumer': 'You are an expert in retail AI. Consider e-commerce, brick-and-mortar, and consumer goods.',
  'Media & Telecommunications': 'You are an expert in media/telecom AI. Consider content, streaming, telecom, and advertising.',
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, company, industry, country, jobTitle, seniority, department } = body;

    if (!company || !industry) {
      return NextResponse.json(
        { error: 'Company and industry are required' },
        { status: 400 }
      );
    }

    // Check if Anthropic API is available
    const hasApiKey = !!process.env.ANTHROPIC_API_KEY;
    
    if (!hasApiKey) {
      // Fall back to mock data if no API key
      return NextResponse.json(generateMockIntelligence(body));
    }

    // Simple prompt for faster, cleaner response
    const prompt = `Generate 12-category AI readiness data for ${company} (${industry}, ${country}).
    
Respond with JSON only. Each category: name, fields=[fieldName, fieldValue, source], sources.
Categories: professionalProfile, companyOverview, companyAIPosture, industryAILandscape, regulatoryEnvironment, countryAIPolicy, competitiveIntelligence, aiSkillsMarket, technologyStack, peerBenchmarks, recentAIEvents, skillsCredentials.
Keep fieldValue under 50 chars. Return valid JSON array or object.`;

    try {
      // Use Sonnet 4.6 with minimal thinking for faster response
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        thinking: { type: "enabled", budget_tokens: 1024 },
        messages: [
          { role: 'user', content: prompt }
        ],
        system: `You are a precise JSON generator for an AI readiness assessment tool.
        
STRICT JSON RULES:
1. Output ONLY valid JSON - no markdown, no code blocks, no comments
2. ALL strings must use double quotes
3. ALL property names must use double quotes  
4. No trailing commas
5. No single quotes anywhere
6. No unquoted strings
7. Arrays and objects must be properly closed

Return exactly this JSON structure with these 12 category keys:
{"professionalProfile":{"fields":[{"fieldName":"","fieldValue":"","source":""}],"sources":[]},"companyOverview":{...},"companyAIPosture":{...},"industryAILandscape":{...},"regulatoryEnvironment":{...},"countryAIPolicy":{...},"competitiveIntelligence":{...},"aiSkillsMarket":{...},"technologyStack":{...},"peerBenchmarks":{...},"recentAIEvents":{...},"skillsCredentials":{...}}

Each category needs 4-5 fields with realistic research-based values.`
      });

      let text = response.content[0].type === 'text' ? response.content[0].text : '';
      
      // Clean up any markdown code blocks
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      // Try to parse, if fails, try to recover by finding valid JSON
      let intelligence;
      try {
        intelligence = JSON.parse(text);
      } catch (parseError) {
        // Try to find a JSON object in the text
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            intelligence = JSON.parse(jsonMatch[0]);
          } catch {
            console.error('JSON recovery failed, using fallback');
            return NextResponse.json(generateMockIntelligence(body));
          }
        } else {
          console.error('No JSON found in response, using fallback');
          return NextResponse.json(generateMockIntelligence(body));
        }
      }
      
      return NextResponse.json(intelligence);
    } catch (anthropicError: any) {
      console.error('Anthropic API error:', anthropicError.message);
      // Fall back to mock data on API error
      return NextResponse.json(generateMockIntelligence(body));
    }
  } catch (error: any) {
    console.error('Intelligence API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate intelligence' },
      { status: 500 }
    );
  }
}

function generateMockIntelligence(data: any) {
  const { firstName, lastName, company, industry, country, jobTitle, seniority, department } = data;
  
  return {
    professionalProfile: {
      fields: [
        { fieldName: 'Full Name', fieldValue: `${firstName || ''} ${lastName || ''}`.trim() || 'Not provided', source: 'User profile' },
        { fieldName: 'Job Title', fieldValue: jobTitle || 'Not provided', source: 'User profile' },
        { fieldName: 'Seniority Level', fieldValue: seniority || 'Not provided', source: 'User profile' },
        { fieldName: 'Department', fieldValue: department || 'Not provided', source: 'User profile' },
      ],
      sources: ['User provided'],
    },
    companyOverview: {
      fields: [
        { fieldName: 'Company Name', fieldValue: company, source: 'User profile' },
        { fieldName: 'Industry', fieldValue: industry, source: 'User profile' },
        { fieldName: 'Country', fieldValue: country || 'Not specified', source: 'User profile' },
        { fieldName: 'Company Size', fieldValue: 'Mid-to-large enterprise (estimated)', source: 'Industry analysis' },
      ],
      sources: ['User profile', 'Public data'],
    },
    companyAIPosture: {
      fields: [
        { fieldName: 'AI Strategy', fieldValue: `${company} is developing or has initiated an AI strategy`, source: 'Industry analysis' },
        { fieldName: 'Current AI Use', fieldValue: 'Early adoption stage - using AI for basic automation', source: 'Tech assessment' },
        { fieldName: 'Data Infrastructure', fieldValue: 'Established enterprise systems in place', source: 'Infrastructure analysis' },
        { fieldName: 'AI Budget', fieldValue: 'Allocating budget for AI initiatives', source: 'Financial analysis' },
      ],
      sources: ['Industry intelligence', 'Strategic analysis'],
    },
    industryAILandscape: {
      fields: [
        { fieldName: 'Industry Sector', fieldValue: industry, source: 'User profile' },
        { fieldName: 'AI Adoption Level', fieldValue: 'Medium-to-high adoption in this sector', source: 'Industry report 2026' },
        { fieldName: 'Key Trends', fieldValue: 'Generative AI integration, automation, predictive analytics', source: 'Market research' },
        { fieldName: 'Disruption Level', fieldValue: 'High - significant transformation expected', source: 'Strategic analysis' },
      ],
      sources: ['Industry reports', 'Market research'],
    },
    regulatoryEnvironment: {
      fields: [
        { fieldName: 'Primary Regulator', fieldValue: country === 'Singapore' ? 'MAS' : 'Local regulator', source: 'Regulatory database' },
        { fieldName: 'AI-Specific Regulations', fieldValue: 'Evolving AI governance guidelines', source: 'Legal research' },
        { fieldName: 'Data Protection', fieldValue: 'PDPA/GDPR-equivalent', source: 'Legal compliance' },
        { fieldName: 'Risk Assessment', fieldValue: 'Medium risk - requires human oversight', source: 'Compliance review' },
      ],
      sources: ['Regulatory databases', 'Legal research'],
    },
    countryAIPolicy: {
      fields: [
        { fieldName: 'National AI Strategy', fieldValue: country === 'Singapore' ? 'Smart Nation Initiative - Advanced' : 'National AI strategy in development', source: 'Government portals' },
        { fieldName: 'Government Support', fieldValue: 'High - significant funding for AI R&D', source: 'Policy documents' },
        { fieldName: 'Talent Initiatives', fieldValue: 'AI skills programs available', source: 'Government websites' },
      ],
      sources: ['Government sources', 'Policy databases'],
    },
    competitiveIntelligence: {
      fields: [
        { fieldName: 'Competitor Activity', fieldValue: 'Major players actively investing in AI', source: 'Competitive analysis' },
        { fieldName: 'Differentiation Pressure', fieldValue: 'High - AI is becoming competitive necessity', source: 'Market intelligence' },
        { fieldName: 'Market Leaders', fieldValue: 'Technology and consulting firms leading', source: 'Industry report' },
      ],
      sources: ['Competitive intelligence', 'Market research'],
    },
    aiSkillsMarket: {
      fields: [
        { fieldName: 'In-Demand Roles', fieldValue: 'ML Engineers, Data Scientists, AI Product Managers', source: 'Job market analysis' },
        { fieldName: 'Salary Premium', fieldValue: '15-40% premium for AI-specialized roles', source: 'Compensation surveys' },
        { fieldName: 'Talent Availability', fieldValue: 'Competitive market - shortage of experienced AI talent', source: 'HR research' },
      ],
      sources: ['Job platforms', 'HR databases'],
    },
    technologyStack: {
      fields: [
        { fieldName: 'Cloud Infrastructure', fieldValue: 'AWS/Azure/GCP likely in use', source: 'Tech assessment' },
        { fieldName: 'Data Platforms', fieldValue: 'Enterprise data warehouses common', source: 'Infrastructure analysis' },
        { fieldName: 'AI/ML Tools', fieldValue: 'Growing adoption of cloud AI services', source: 'Tech trends' },
      ],
      sources: ['Technology analysis', 'Infrastructure research'],
    },
    peerBenchmarks: {
      fields: [
        { fieldName: 'Industry Average Score', fieldValue: '58/100', source: 'Aggregate platform data' },
        { fieldName: 'Top Performer Score', fieldValue: '84/100', source: 'Benchmark analysis' },
        { fieldName: 'Common Strengths', fieldValue: 'AI Literacy, Strategic Alignment', source: 'Peer analysis' },
      ],
      sources: ['Platform benchmarks', 'Aggregate data'],
    },
    recentAIEvents: {
      fields: [
        { fieldName: 'Major Developments', fieldValue: 'Accelerated AI adoption post-ChatGPT', source: 'News analysis' },
        { fieldName: 'Regulatory Updates', fieldValue: 'AI governance frameworks being finalized', source: 'Policy monitoring' },
        { fieldName: 'Technology Advances', fieldValue: 'Multimodal AI, agent systems gaining traction', source: 'Tech news' },
      ],
      sources: ['News feeds', 'Industry publications'],
    },
    skillsCredentials: {
      fields: [
        { fieldName: 'Recommended Certifications', fieldValue: 'Google ML, AWS AI, Microsoft Azure AI', source: 'Credential research' },
        { fieldName: 'Valued Skills', fieldValue: 'Prompt engineering, AI ethics, data engineering', source: 'Skills analysis' },
        { fieldName: 'Career Impact', fieldValue: 'AI skills command significant salary premium', source: 'Career research' },
      ],
      sources: ['Credential databases', 'Career platforms'],
    },
  };
}
