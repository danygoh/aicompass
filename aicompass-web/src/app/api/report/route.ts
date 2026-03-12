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
      insight: getStrengthInsight(d.name, d.score, d.max)
    }));
    const gaps = sortedDims.slice(-2).map(d => ({
      dimension: d.name,
      score: d.score,
      max: d.max,
      percentage: Math.round((d.score / d.max) * 100),
      insight: getGapInsight(d.name, d.score, d.max)
    }));

    // Generate recommendations
    const recommendations = generateRecommendations(dimensions, profile, intelligence);
    
    // Executive summary
    const executiveSummary = generateExecutiveSummary(profile, totalScore, tier, dimensions);
    
    // Next steps
    const nextSteps = generateNextSteps(dimensions, gaps.map(g => g.insight), profile);

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
      
      // ALL 12 intelligence categories
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

function getStrengthInsight(dimension: string, score: number, max: number): string {
  const insights: Record<string, string> = {
    'AI Literacy': `Your leadership team demonstrates strong understanding of AI fundamentals and can make informed decisions about AI investments.`,
    'Strategy & Vision': `Your organisation has established clear AI vision and strategic direction.`,
    'Data & Infrastructure': `Your data foundation is solid, with quality data available for AI initiatives.`,
    'Culture & Skills': `Your organisational culture supports AI adoption with relevant skills distributed across teams.`,
    'Governance & Ethics': `You have established frameworks for responsible AI use, building stakeholder trust.`
  };
  return insights[dimension] || `Strong performance in ${dimension}.`;
}

function getGapInsight(dimension: string, score: number, max: number): string {
  const insights: Record<string, string> = {
    'AI Literacy': `Building AI literacy across leadership is critical for informed decision-making on AI investments.`,
    'Strategy & Vision': `A clearer AI strategy would help prioritise initiatives and align with business objectives.`,
    'Data & Infrastructure': `Strengthening data infrastructure is foundational to AI effectiveness.`,
    'Culture & Skills': `Building AI skills and cultural readiness is essential for sustainable adoption.`,
    'Governance & Ethics': `Establishing governance frameworks is increasingly important as AI scales.`
  };
  return insights[dimension] || `Focus on improving ${dimension}.`;
}

function generateExecutiveSummary(profile: any, totalScore: number, tier: string, dimensions: any[]): string {
  const name = profile.firstName || 'there';
  const company = profile.company || 'your organisation';
  const industry = profile.industry || 'your industry';
  
  let summary = `# Executive Summary\n\n`;
  summary += `Dear ${name},\n\n`;
  summary += `Thank you for completing the AI Compass Assessment. This report provides a comprehensive evaluation of ${company} in the ${industry} sector and outlines a strategic roadmap for your AI transformation journey.\n\n`;
  
  // Overall assessment
  const tierNames: Record<string, string> = {
    'Beginner': 'Early Stages',
    'Developing': 'Developing Stage', 
    'Progressive': 'Progressive Stage',
    'Advanced': 'Advanced Stage',
    'Leading': 'Leading Stage'
  };
  
  summary += `## Overall Assessment: ${tierNames[tier] || tier}\n\n`;
  summary += `Your score of **${totalScore}/100** places ${company} at the ${tierNames[tier] || tier.toLowerCase()} of AI readiness.\n\n`;
  
  // Key insights
  const sortedDims = [...dimensions].sort((a, b) => b.score - a.score);
  const topDim = sortedDims[0];
  const lowDim = sortedDims[sortedDims.length - 1];
  
  summary += `### Key Insights\n\n`;
  summary += `Your strongest area is **${topDim.name}** (${Math.round((topDim.score/topDim.max)*100)}%). Focus area: **${lowDim.name}** (${Math.round((lowDim.score/lowDim.max)*100)}%).\n\n`;
  
  summary += `### Recommendations Overview\n\n`;
  summary += `This report includes detailed recommendations across five key dimensions of AI readiness. Each recommendation includes specific actions, timelines, and expected impact.\n\n`;
  
  return summary;
}

function generateOverview(intelligence: any, profile: any): string {
  const company = profile.company || 'Your organisation';
  const industry = profile.industry || 'technology';
  
  let overview = `# Assessment Overview\n\n`;
  
  // Company Overview
  if (intelligence?.companyOverview) {
    overview += `## Company Profile\n\n`;
    for (const field of intelligence.companyOverview.fields || []) {
      overview += `**${field.fieldName}**: ${field.fieldValue}\n\n`;
    }
  }
  
  // Industry Landscape
  if (intelligence?.industryAILandscape) {
    overview += `## Industry Landscape\n\n`;
    for (const field of intelligence.industryAILandscape.fields || []) {
      overview += `**${field.fieldName}**: ${field.fieldValue}\n\n`;
    }
  }
  
  return overview;
}

function generateRecommendations(dimensions: any[], profile: any, intelligence: any): any[] {
  const recommendations = [];
  const company = profile.company || 'your organisation';
  
  const sorted = [...dimensions].sort((a, b) => a.score - b.score);
  
  for (const dim of sorted.slice(0, 3)) {
    const percentage = Math.round((dim.score / dim.max) * 100);
    
    if (dim.name === 'AI Literacy' && percentage < 70) {
      recommendations.push({
        priority: percentage < 50 ? 'high' : 'medium',
        dimension: 'AI Literacy',
        title: 'Build AI Fundamentals Across Leadership',
        description: `Invest in AI education for leadership to make informed strategic decisions about AI investments.`,
        whyItMatters: `Leaders with AI understanding can identify high-value use cases and allocate resources effectively.`,
        actions: [
          'Enroll executives in AI strategy programs',
          'Schedule quarterly AI trend briefings',
          'Create an internal AI champions network',
        ],
        timeline: '3-6 months',
        impact: 'High',
      });
    }
    
    if (dim.name === 'Strategy & Vision' && percentage < 70) {
      recommendations.push({
        priority: percentage < 50 ? 'high' : 'medium',
        dimension: 'Strategy & Vision',
        title: 'Develop Comprehensive AI Roadmap',
        description: `Create a clear AI strategy aligned with business objectives to guide investments and prioritisation.`,
        whyItMatters: `Strategic clarity enables better decision-making and organisational alignment.`,
        actions: [
          'Conduct AI opportunity assessment workshops',
          'Define clear AI vision and success metrics',
          'Identify 2-3 quick wins for immediate value',
          'Create a 3-year AI implementation roadmap',
        ],
        timeline: '1-3 months to develop strategy',
        impact: 'High',
      });
    }
    
    if (dim.name === 'Data & Infrastructure' && percentage < 70) {
      recommendations.push({
        priority: percentage < 50 ? 'high' : 'medium',
        dimension: 'Data & Infrastructure',
        title: 'Strengthen Data Foundation',
        description: `Assess and improve data quality, accessibility, and governance for AI initiatives.`,
        whyItMatters: `Quality data is essential for reliable AI outputs and successful deployment.`,
        actions: [
          'Conduct data maturity assessment',
          'Implement data quality management processes',
          'Evaluate cloud AI services',
          'Establish data governance framework',
        ],
        timeline: '6-12 months',
        impact: 'High',
      });
    }
    
    if (dim.name === 'Culture & Skills' && percentage < 70) {
      recommendations.push({
        priority: 'medium',
        dimension: 'Culture & Skills',
        title: 'Upskill Workforce for AI',
        description: `Build internal AI capabilities through training and talent development.`,
        whyItMatters: `Internal capabilities ensure sustainable AI adoption and knowledge retention.`,
        actions: [
          'Launch targeted AI upskilling programs',
          'Hire AI specialists for strategic projects',
          'Create knowledge sharing sessions',
          'Identify AI champions in each department',
        ],
        timeline: '6-12 months',
        impact: 'Medium to High',
      });
    }
    
    if (dim.name === 'Governance & Ethics' && percentage < 70) {
      recommendations.push({
        priority: 'medium',
        dimension: 'Governance & Ethics',
        title: 'Establish AI Governance Framework',
        description: `Implement responsible AI practices and ethical guidelines for AI deployment.`,
        whyItMatters: `Governance builds trust and ensures compliance with evolving regulations.`,
        actions: [
          'Define AI ethics principles',
          'Create AI risk assessment processes',
          'Establish governance committee',
          'Implement clear usage policies',
        ],
        timeline: '3-6 months',
        impact: 'Medium to High',
      });
    }
  }
  
  // Add intelligence-based recommendations
  if (intelligence?.peerBenchmarks) {
    recommendations.push({
      priority: 'medium',
      dimension: 'Competitive Position',
      title: 'Learn from Industry Peers',
      description: `Leverage insights from peer organisations to inform your AI strategy.`,
      whyItMatters: `Understanding peer approaches helps identify best practices and differentiation opportunities.`,
      actions: [
        'Study competitor AI initiatives',
        'Join industry AI consortia',
        'Attend relevant conferences',
      ],
      timeline: 'Ongoing',
      impact: 'Medium',
    });
  }
  
  return recommendations.slice(0, 6);
}

function generateNextSteps(dimensions: any[], gaps: string[], profile: any): string[] {
  const name = profile.firstName || 'you';
  
  return [
    `Schedule a strategy session to discuss assessment findings and prioritise next steps`,
    `Engage ${name} as an AI champion to drive internal awareness`,
    'Prioritise highest-impact recommendations based on business goals',
    'Create a 90-day action plan with clear ownership and milestones',
    'Establish baseline metrics to track progress over time',
    'Consider engaging AI advisory support for targeted implementation',
    'Schedule follow-up assessment in 6 months to measure improvement',
  ];
}
