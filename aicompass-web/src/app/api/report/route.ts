import { NextResponse } from 'next/server';

// 12 intelligence categories
const INTELLIGENCE_CATEGORIES = [
  'professionalProfile',
  'companyOverview', 
  'companyAIPosture',
  'industryAILandscape',
  'regulatoryEnvironment',
  'countryAIPolicy',
  'competitiveIntelligence',
  'aiSkillsMarket',
  'technologyStack',
  'peerBenchmarks',
  'recentAIEvents',
  'skillsCredentials'
];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      profile, 
      responses, 
      intelligence, 
      totalScore, 
      dimensionScores,
      tier,
      reportId 
    } = body;

    if (!profile || !responses) {
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 });
    }

    // Calculate dimension scores
    const dimensions = [
      { name: 'AI Literacy', score: dimensionScores[0], max: 20 },
      { name: 'Strategy & Vision', score: dimensionScores[1], max: 20 },
      { name: 'Data & Infrastructure', score: dimensionScores[2], max: 20 },
      { name: 'Culture & Skills', score: dimensionScores[3], max: 20 },
      { name: 'Governance & Ethics', score: dimensionScores[4], max: 20 },
    ];

    // Strengths and gaps
    const sortedDims = [...dimensions].sort((a, b) => b.score - a.score);
    const strengths = sortedDims.slice(0, 2).map(d => ({
      dimension: d.name,
      score: d.score,
      max: d.max,
      percentage: Math.round((d.score / d.max) * 100),
      insight: getStrengthInsight(d.name, d.score, d.max, profile)
    }));
    const gaps = sortedDims.slice(-2).map(d => ({
      dimension: d.name,
      score: d.score,
      max: d.max,
      percentage: Math.round((d.score / d.max) * 100),
      insight: getGapInsight(d.name, d.score, d.max, profile)
    }));

    // Generate personalized recommendations using responses + intelligence
    const recommendations = generateRecommendations(dimensions, profile, intelligence, responses);
    
    // Tier-based executive summary
    const executiveSummary = generateExecutiveSummary(profile, totalScore, tier, dimensions, intelligence);
    
    // Next steps
    const nextSteps = generateNextSteps(dimensions, gaps, profile, responses);

    // Extract ALL 12 intelligence categories
    const intelligenceHighlights = extractAllIntelligence(intelligence);

    const report = {
      reportId: reportId || `AIC-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      
      profile: {
        name: `${profile.firstName} ${profile.lastName}`.trim() || 'Anonymous',
        title: profile.jobTitle || 'Not specified',
        company: profile.company || 'Not specified',
        industry: profile.industry || 'Not specified',
        country: profile.country || 'Not specified',
        seniority: profile.seniority || 'Not specified',
      },
      
      score: {
        total: totalScore || 0,
        tier: tier || 'Beginner',
        dimensions,
      },
      
      executiveSummary,
      
      findings: {
        strengths,
        gaps,
        overview: generateOverview(intelligence, profile),
      },
      
      recommendations,
      
      nextSteps,
      
      intelligence: intelligenceHighlights,
    };

    return NextResponse.json(report);
  } catch (error: any) {
    console.error('Report generation error:', error);
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}

// Extract ALL 12 intelligence categories
function extractAllIntelligence(intelligence: any) {
  const highlights: any = {};
  
  for (const category of INTELLIGENCE_CATEGORIES) {
    if (intelligence?.[category]?.fields) {
      highlights[category] = intelligence[category].fields.map((f: any) => ({
        name: f.fieldName,
        value: f.fieldValue,
        source: f.source
      }));
    }
  }
  
  return highlights;
}

// Personalized strength insight
function getStrengthInsight(dimension: string, score: number, max: number, profile: any): string {
  const company = profile.company || 'Your organisation';
  const pct = Math.round((score / max) * 100);
  
  const insights: Record<string, string> = {
    'AI Literacy': `Your leadership team at ${company} demonstrates strong understanding of AI fundamentals. This foundation enables informed decision-making on AI investments and positions the organisation to identify high-value use cases.`,
    'Strategy & Vision': `${company} has established clear AI vision and strategic direction. This clarity provides a roadmap for measuring AI initiative success and enables prioritised resource allocation.`,
    'Data & Infrastructure': `${company}'s data foundation is solid, with quality data available for AI initiatives. This enables faster deployment of AI solutions and more reliable outputs.`,
    'Culture & Skills': `The organisational culture at ${company} supports AI adoption with relevant skills distributed across teams. This creates a fertile environment for AI initiatives to gain traction.`,
    'Governance & Ethics': `${company} has established frameworks for responsible AI use, building stakeholder trust and positioning well for evolving regulatory requirements.`
  };
  return insights[dimension] || `Strong performance in ${dimension} provides a solid foundation for AI initiatives.`;
}

// Personalized gap insight
function getGapInsight(dimension: string, score: number, max: number, profile: any): string {
  const company = profile.company || 'Your organisation';
  const pct = Math.round((score / max) * 100);
  
  const insights: Record<string, string> = {
    'AI Literacy': `Building AI literacy across leadership at ${company} is critical. Without understanding AI capabilities, leaders may struggle to evaluate investments effectively or identify high-value use cases.`,
    'Strategy & Vision': `${company} would benefit from a clearer AI strategy to prioritise initiatives and align AI investments with business objectives.`,
    'Data & Infrastructure': `Strengthening data infrastructure at ${company} is foundational. Poor data quality limits AI effectiveness and can lead to unreliable outputs.`,
    'Culture & Skills': `Building AI skills and cultural readiness at ${company} is essential for sustainable adoption. Skills gaps can lead to over-reliance on external consultants.`,
    'Governance & Ethics': `Establishing governance frameworks at ${company} is increasingly important as AI scales. Without clear guidelines, the organisation faces regulatory and ethical risks.`
  };
  return insights[dimension] || `Focus on improving ${dimension} to accelerate AI maturity at ${company}.`;
}

// Tier-based personalized executive summary
function generateExecutiveSummary(profile: any, totalScore: number, tier: string, dimensions: any[], intelligence: any): string {
  const name = profile.firstName || 'there';
  const company = profile.company || 'your organisation';
  const industry = profile.industry || 'your industry';
  const seniority = profile.seniority || 'professional';
  
  const tierData: Record<string, { level: string, description: string }> = {
    'Beginner': { level: 'early stages', description: 'foundational opportunities' },
    'Developing': { level: 'developing stage', description: 'clear path forward' },
    'Progressive': { level: 'progressive stage', description: 'significant progress' },
    'Advanced': { level: 'advanced stage', description: 'leadership position' },
    'Leading': { level: 'leading position', description: 'industry benchmarks' }
  };
  
  const t = tierData[tier] || { level: 'current stage', description: 'improvement opportunities' };
  
  let summary = `# Executive Summary\n\n`;
  summary += `Dear ${name},\n\n`;
  summary += `Thank you for completing the AI Compass Assessment. This comprehensive evaluation of ${company} in the ${industry} sector reveals your current AI readiness level and provides a strategic roadmap for your AI transformation journey.\n\n`;
  
  summary += `## Overall Assessment: ${tier}\n\n`;
  summary += `Your score of **${totalScore}/100** places ${company} at the ${t.level} of AI readiness with ${t.description}.\n\n`;
  
  // Company-specific context from intelligence
  if (intelligence?.companyOverview?.fields?.[0]) {
    summary += `## Company Context\n\n`;
    summary += `${intelligence.companyOverview.fields[0].fieldValue}\n\n`;
  }
  
  // Key insights
  const sortedDims = [...dimensions].sort((a, b) => b.score - a.score);
  const topDim = sortedDims[0];
  const lowDim = sortedDims[sortedDims.length - 1];
  
  summary += `### Key Insights\n\n`;
  summary += `**Strength**: ${topDim.name} (${Math.round((topDim.score/topDim.max)*100)}%) - ${getShortInsight(topDim.name)}\n\n`;
  summary += `**Priority**: ${lowDim.name} (${Math.round((lowDim.score/lowDim.max)*100)}%) - ${getShortGap(lowDim.name)}\n\n`;
  
  // Industry context
  if (intelligence?.industryAILandscape?.fields?.[0]) {
    summary += `### Industry Context\n\n`;
    summary += `${intelligence.industryAILandscape.fields[0].fieldValue}\n\n`;
  }
  
  summary += `### What's Included in This Report\n\n`;
  summary += `- Detailed score analysis across 5 dimensions\n`;
  summary += `- Personalized recommendations based on your responses\n`;
  summary += `- Industry-specific intelligence for ${company}\n`;
  summary += `- Actionable next steps for your AI journey\n\n`;
  
  return summary;
}

function getShortInsight(dim: string): string {
  const insights: Record<string, string> = {
    'AI Literacy': 'Strong foundation for informed AI decisions',
    'Strategy & Vision': 'Clear AI direction established',
    'Data & Infrastructure': 'Solid data foundation for AI',
    'Culture & Skills': 'Supportive culture for AI adoption',
    'Governance & Ethics': 'Responsible AI practices in place'
  };
  return insights[dim] || 'Strong foundation';
}

function getShortGap(dim: string): string {
  const gaps: Record<string, string> = {
    'AI Literacy': 'Build leadership AI understanding',
    'Strategy & Vision': 'Define clear AI strategy',
    'Data & Infrastructure': 'Strengthen data capabilities',
    'Culture & Skills': 'Develop AI skills across organisation',
    'Governance & Ethics': 'Establish AI governance framework'
  };
  return gaps[dim] || 'Needs improvement';
}

function generateOverview(intelligence: any, profile: any): string {
  const company = profile.company || 'Your organisation';
  const industry = profile.industry || 'technology';
  
  let overview = `# Assessment Overview\n\n`;
  
  if (intelligence?.companyOverview) {
    overview += `## Company Profile\n\n`;
    for (const field of intelligence.companyOverview.fields || []) {
      overview += `**${field.fieldName}**: ${field.fieldValue}\n\n`;
    }
  }
  
  if (intelligence?.industryAILandscape) {
    overview += `## Industry Landscape\n\n`;
    for (const field of intelligence.industryAILandscape.fields || []) {
      overview += `**${field.fieldName}**: ${field.fieldValue}\n\n`;
    }
  }
  
  return overview;
}

// Generate recommendations using responses + intelligence
function generateRecommendations(dimensions: any[], profile: any, intelligence: any, responses: any[]): any[] {
  const recommendations = [];
  const company = profile.company || 'your organisation';
  const sorted = [...dimensions].sort((a, b) => a.score - b.score);
  
  // Get company-specific examples from intelligence
  const companyExamples = getCompanyExamples(intelligence, company);
  
  for (const dim of sorted.slice(0, 3)) {
    const percentage = Math.round((dim.score / dim.max) * 100);
    const priority = percentage < 50 ? 'high' : 'medium';
    
    // Generate dimension-specific recommendations
    const rec = getDimensionRecommendation(dim, percentage, company, companyExamples);
    if (rec) {
      recommendations.push({ priority, ...rec });
    }
  }
  
  // Add competitive intelligence recommendation
  if (intelligence?.peerBenchmarks?.fields?.[0]) {
    recommendations.push({
      priority: 'medium',
      dimension: 'Competitive Position',
      title: 'Learn from Industry Peers',
      description: `Peer organisations are advancing their AI capabilities. Understanding their approaches can inform your strategy.`,
      whyItMatters: `Benchmarking against peers helps identify best practices and differentiation opportunities.`,
      companyInsight: intelligence.peerBenchmarks.fields[0].fieldValue,
      actions: [
        'Study competitor AI initiatives',
        'Join industry AI consortia',
        'Attend relevant conferences',
      ],
      timeline: 'Ongoing',
      impact: 'Medium'
    });
  }
  
  return recommendations.slice(0, 6);
}

function getCompanyExamples(intelligence: any, company: string) {
  const examples: Record<string, string> = {};
  
  if (intelligence?.companyAIPosture?.fields?.[0]) {
    examples.companyAIPosture = intelligence.companyAIPosture.fields[0].fieldValue;
  }
  if (intelligence?.technologyStack?.fields?.[0]) {
    examples.technologyStack = intelligence.technologyStack.fields[0].fieldValue;
  }
  if (intelligence?.aiSkillsMarket?.fields?.[0]) {
    examples.aiSkillsMarket = intelligence.aiSkillsMarket.fields[0].fieldValue;
  }
  
  return examples;
}

function getDimensionRecommendation(dim: any, percentage: number, company: string, examples: any) {
  const base = { company, examples };
  
  if (dim.name === 'AI Literacy') {
    return {
      dimension: 'AI Literacy',
      title: 'Build AI Fundamentals Across Leadership',
      description: `Building AI literacy across leadership at ${company} is essential for making informed strategic decisions about AI investments.`,
      whyItMatters: `Leaders with AI understanding can identify high-value use cases, allocate resources effectively, and champion AI initiatives.`,
      companyInsight: examples.companyAIPosture || null,
      actions: [
        'Enroll executives in AI strategy programs (MIT, Stanford, or similar)',
        'Schedule quarterly AI trend briefings for leadership',
        'Create internal AI champions network',
        'Bring in external speakers for perspective',
      ],
      timeline: '3-6 months to establish foundational knowledge',
      impact: 'High'
    };
  }
  
  if (dim.name === 'Strategy & Vision') {
    return {
      dimension: 'Strategy & Vision',
      title: 'Develop Comprehensive AI Roadmap',
      description: `Creating a clear AI strategy aligned with business objectives will help ${company} prioritise initiatives and measure success.`,
      whyItMatters: `Strategic clarity enables better decision-making and helps align AI investments with business goals.`,
      companyInsight: examples.companyAIPosture || null,
      actions: [
        'Conduct AI opportunity assessment workshops',
        'Define clear AI vision and success metrics',
        'Identify 2-3 quick wins for immediate value',
        'Create a 3-year AI implementation roadmap',
      ],
      timeline: '1-3 months to develop strategy',
      impact: 'High'
    };
  }
  
  if (dim.name === 'Data & Infrastructure') {
    return {
      dimension: 'Data & Infrastructure',
      title: 'Strengthen Data Foundation',
      description: `Strengthening data infrastructure at ${company} is foundational to AI effectiveness.`,
      whyItMatters: `Quality data enables reliable AI outputs and faster deployment of solutions.`,
      companyInsight: examples.technologyStack || null,
      actions: [
        'Conduct comprehensive data maturity assessment',
        'Implement data quality management processes',
        'Evaluate cloud AI services (AWS, Azure, GCP)',
        'Establish clear data governance framework',
      ],
      timeline: '6-12 months for foundational improvements',
      impact: 'High'
    };
  }
  
  if (dim.name === 'Culture & Skills') {
    return {
      dimension: 'Culture & Skills',
      title: 'Upskill Workforce for AI',
      description: `Building AI capabilities within ${company} is essential for sustainable adoption.`,
      whyItMatters: `Internal capabilities ensure knowledge retention and reduce reliance on external consultants.`,
      companyInsight: examples.aiSkillsMarket || null,
      actions: [
        'Launch targeted AI upskilling programs',
        'Hire AI specialists for strategic projects',
        'Create knowledge sharing sessions',
        'Identify AI champions in each department',
      ],
      timeline: '6-12 months for meaningful capability building',
      impact: 'Medium to High'
    };
  }
  
  if (dim.name === 'Governance & Ethics') {
    return {
      dimension: 'Governance & Ethics',
      title: 'Establish AI Governance Framework',
      description: `Implementing responsible AI practices is critical for ${company} as AI adoption scales.`,
      whyItMatters: `Governance builds trust and ensures compliance with evolving regulations.`,
      actions: [
        'Define clear AI ethics principles',
        'Create AI risk assessment processes',
        'Establish governance committee',
        'Implement clear usage policies',
      ],
      timeline: '3-6 months to establish foundational governance',
      impact: 'Medium to High'
    };
  }
  
  return null;
}

function generateNextSteps(dimensions: any[], gaps: any[], profile: any, responses: any[]): string[] {
  const name = profile.firstName || 'you';
  const company = profile.company || 'your organisation';
  
  return [
    `Schedule a strategy session with ${company}'s leadership to discuss assessment findings and prioritise next steps`,
    `Engage ${name} as an AI champion to drive internal awareness and momentum`,
    `Prioritise the highest-impact recommendations based on ${company}'s immediate business goals`,
    `Create a 90-day action plan with clear ownership, timelines, and measurable milestones`,
    `Establish baseline metrics to track AI readiness progress over time`,
    `Consider engaging an AI consultant for targeted implementation support if needed`,
    `Schedule a follow-up assessment in 6 months to measure improvement and adjust strategy`,
  ];
}
