import { NextResponse } from 'next/server';

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
      return NextResponse.json(
        { error: 'Missing required data' },
        { status: 400 }
      );
    }

    // Calculate dimension scores with labels
    const dimensions = [
      { name: 'AI Literacy', score: dimensionScores[0], max: 20 },
      { name: 'Strategy & Vision', score: dimensionScores[1], max: 20 },
      { name: 'Data & Infrastructure', score: dimensionScores[2], max: 20 },
      { name: 'Culture & Skills', score: dimensionScores[3], max: 20 },
      { name: 'Governance & Ethics', score: dimensionScores[4], max: 20 },
    ];

    // Determine strengths and gaps
    const sortedDims = [...dimensions].sort((a, b) => b.score - a.score);
    const strengths = sortedDims.slice(0, 2).map(d => d.name);
    const gaps = sortedDims.slice(-2).map(d => d.name);

    // Generate personalized recommendations
    const recommendations = generateRecommendations(dimensions, profile, intelligence);
    
    // Generate executive summary
    const executiveSummary = generateExecutiveSummary(profile, totalScore, tier, dimensions);
    
    // Generate next steps
    const nextSteps = generateNextSteps(dimensions, gaps, profile);

    const report = {
      // Header
      reportId: reportId || `AIC-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      
      // Profile summary
      profile: {
        name: `${profile.firstName} ${profile.lastName}`.trim() || 'Anonymous',
        title: profile.jobTitle || 'Not specified',
        company: profile.company || 'Not specified',
        industry: profile.industry || 'Not specified',
        country: profile.country || 'Not specified',
      },
      
      // Score summary
      score: {
        total: totalScore || 0,
        tier: tier || 'Beginner',
        dimensions,
      },
      
      // Executive summary (AI-generated)
      executiveSummary,
      
      // Detailed findings
      findings: {
        strengths,
        gaps,
        overview: generateOverview(intelligence, profile),
      },
      
      // Recommendations (AI-generated)
      recommendations,
      
      // Next steps (AI-generated)
      nextSteps,
      
      // Intelligence highlights
      intelligenceHighlights: extractHighlights(intelligence),
    };

    return NextResponse.json(report);
  } catch (error: any) {
    console.error('Report generation error:', error);
    
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}

function generateExecutiveSummary(profile: any, totalScore: number, tier: string, dimensions: any[]): string {
  const name = profile.firstName || 'there';
  const company = profile.company || 'your organisation';
  const industry = profile.industry || 'your industry';
  const tierName = tier || 'Progressive';
  
  let summary = `${name}, your AI Readiness Assessment reveals a ${tierName.toLowerCase()} level of AI maturity at ${company}. `;
  
  if (totalScore >= 81) {
    summary += `You are leading the pack with a score of ${totalScore}/100. Your organisation demonstrates strong AI capabilities across most dimensions, positioning you as an industry leader in AI adoption. `;
  } else if (totalScore >= 63) {
    summary += `With a score of ${totalScore}/100, you are on a solid AI journey. Your organisation has established foundations and shows promising progress in key areas. `;
  } else if (totalScore >= 45) {
    summary += `At ${totalScore}/100, you are building your AI foundations. While progress has been made, there are clear opportunities to accelerate your AI transformation. `;
  } else {
    summary += `Your score of ${totalScore}/100 indicates early-stage AI adoption. This presents a significant opportunity to build a comprehensive AI strategy from the ground up. `;
  }
  
  // Add dimension-specific insight
  const topDim = dimensions.sort((a, b) => b.score - a.score)[0];
  const lowDim = dimensions.sort((a, b) => a.score - b.score)[0];
  
  summary += `Your strongest area is ${topDim.name}, while ${lowDim.name} presents the greatest opportunity for improvement.`;
  
  return summary;
}

function generateOverview(intelligence: any, profile: any): string {
  const company = profile.company || 'Your organisation';
  const industry = profile.industry || 'technology';
  
  let overview = `Based on research into ${company} and the ${industry} sector, `;
  
  if (intelligence?.companyAIPosture?.fields) {
    const aiStrategy = intelligence.companyAIPosture.fields.find((f: any) => f.fieldName === 'AI Strategy')?.fieldValue;
    if (aiStrategy) {
      overview += `your AI strategy is described as "${aiStrategy}". `;
    }
  }
  
  overview += `The ${industry} sector is experiencing significant AI transformation. Key trends include generative AI integration, automation, and predictive analytics. `;
  
  if (intelligence?.industryAILandscape?.fields) {
    const trend = intelligence.industryAILandscape.fields.find((f: any) => f.fieldName === 'Key Trends')?.fieldValue;
    if (trend) {
      overview += `Industry leaders are focusing on: ${trend}.`;
    }
  }
  
  return overview;
}

function generateRecommendations(dimensions: any[], profile: any, intelligence: any): any[] {
  const recommendations = [];
  const company = profile.company || 'your organisation';
  const industry = profile.industry || 'technology';
  
  // Find lowest scoring dimensions
  const sorted = [...dimensions].sort((a, b) => a.score - b.score);
  
  // Generate recommendations based on gaps
  for (const dim of sorted.slice(0, 3)) {
    const percentage = Math.round((dim.score / dim.max) * 100);
    
    if (dim.name === 'AI Literacy' && percentage < 70) {
      recommendations.push({
        priority: 'high',
        dimension: 'AI Literacy',
        title: 'Build AI Fundamentals Across Leadership',
        description: `Invest in AI literacy programs for your leadership team at ${company}. Understanding AI fundamentals is critical for strategic decision-making.`,
        actions: [
          'Enroll executives in AI strategy programs (MIT Sloan, Stanford AI Executive)',
          'Schedule quarterly AI trend briefings for leadership',
          'Create an internal AI champions network',
        ],
        timeline: '3-6 months',
        impact: 'High',
      });
    }
    
    if (dim.name === 'Strategy & Vision' && percentage < 70) {
      recommendations.push({
        priority: 'high',
        dimension: 'Strategy & Vision',
        title: 'Develop a Comprehensive AI Roadmap',
        description: `Define a clear AI strategy aligned with business objectives for ${company}. A strategic roadmap will guide resource allocation and measure progress.`,
        actions: [
          'Conduct AI opportunity assessment workshops',
          'Define AI vision and success metrics',
          'Identify 2-3 quick wins for immediate value',
          'Create a 3-year AI implementation roadmap',
        ],
        timeline: '1-3 months',
        impact: 'High',
      });
    }
    
    if (dim.name === 'Data & Infrastructure' && percentage < 70) {
      recommendations.push({
        priority: 'high',
        dimension: 'Data & Infrastructure',
        title: 'Strengthen Data Foundation',
        description: `Assess and upgrade your data infrastructure. Effective AI requires clean, accessible, and well-governed data.`,
        actions: [
          'Conduct a data maturity assessment',
          'Implement data quality management processes',
          'Evaluate cloud AI services (AWS, Azure, GCP)',
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
        title: 'Upskill Your Workforce for AI',
        description: `Develop AI skills across ${company}. Building internal capabilities reduces dependency on external consultants.`,
        actions: [
          'Launch AI upskilling programs for relevant teams',
          'Hire or contract AI specialists for key projects',
          'Create internal AI knowledge sharing sessions',
          'Partner with universities for talent pipeline',
        ],
        timeline: '6-12 months',
        impact: 'Medium',
      });
    }
    
    if (dim.name === 'Governance & Ethics' && percentage < 70) {
      recommendations.push({
        priority: 'medium',
        dimension: 'Governance & Ethics',
        title: 'Establish AI Governance Framework',
        description: `Implement responsible AI practices at ${company}. Governance is essential for sustainable AI adoption.`,
        actions: [
          'Define AI ethics principles and guidelines',
          'Create AI risk assessment processes',
          'Establish AI governance committee',
          'Implement AI usage policies',
        ],
        timeline: '3-6 months',
        impact: 'Medium',
      });
    }
  }
  
  // Add industry-specific recommendation
  if (intelligence?.industryAILandscape?.fields) {
    const trend = intelligence.industryAILandscape.fields.find((f: any) => f.fieldName === 'Key Trends')?.fieldValue;
    if (trend) {
      recommendations.push({
        priority: 'medium',
        dimension: 'Industry Position',
        title: 'Leverage Industry AI Trends',
        description: `Stay competitive by adopting: ${trend}`,
        actions: [
          'Monitor competitor AI initiatives',
          'Evaluate emerging AI technologies in your sector',
          'Consider strategic partnerships with AI providers',
        ],
        timeline: 'Ongoing',
        impact: 'Medium',
      });
    }
  }
  
  return recommendations.slice(0, 6); // Max 6 recommendations
}

function generateNextSteps(dimensions: any[], gaps: string[], profile: any): string[] {
  const company = profile.company || 'your organisation';
  
  const nextSteps = [
    `Schedule a strategy session with ${company}'s leadership to discuss assessment findings`,
    'Prioritize the highest-impact recommendations based on your business goals',
    'Create a 90-day action plan with clear ownership and milestones',
    'Establish baseline metrics to track AI readiness progress',
    'Consider engaging an AI consultant for targeted implementation support',
    'Re-assess in 6 months to measure improvement',
  ];
  
  return nextSteps;
}

function extractHighlights(intelligence: any): any {
  const highlights: any = {};
  
  if (intelligence?.companyAIPosture) {
    highlights.companyAIPosture = intelligence.companyAIPosture.fields.slice(0, 3);
  }
  
  if (intelligence?.industryAILandscape) {
    highlights.industryAILandscape = intelligence.industryAILandscape.fields.slice(0, 3);
  }
  
  if (intelligence?.countryAIPolicy) {
    highlights.countryAIPolicy = intelligence.countryAIPolicy.fields.slice(0, 3);
  }
  
  if (intelligence?.regulatoryEnvironment) {
    highlights.regulatoryEnvironment = intelligence.regulatoryEnvironment.fields.slice(0, 3);
  }
  
  return highlights;
}
