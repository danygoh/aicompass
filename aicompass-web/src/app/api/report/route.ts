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

    // Determine strengths and gaps with detailed info
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

function getStrengthInsight(dimension: string, score: number, max: number): string {
  const pct = Math.round((score / max) * 100);
  const insights: Record<string, string> = {
    'AI Literacy': `Your leadership team demonstrates strong understanding of AI fundamentals and can make informed decisions about AI investments. This foundation enables effective evaluation of AI proposals and champions innovation throughout the organisation.`,
    'Strategy & Vision': `Your organisation has established clear AI vision and strategic direction. This clarity enables prioritised resource allocation and provides a roadmap for measuring AI initiative success.`,
    'Data & Infrastructure': `Your data foundation is solid, with quality data available for AI initiatives. This enables faster deployment of AI solutions and more reliable outputs from AI systems.`,
    'Culture & Skills': `Your organisational culture supports AI adoption with relevant skills distributed across teams. This creates a fertile environment for AI initiatives to gain traction and deliver value.`,
    'Governance & Ethics': `You have established frameworks for responsible AI use, which builds stakeholder trust and positions your organisation well for evolving regulatory requirements.`
  };
  return insights[dimension] || `Strong performance in ${dimension} provides a solid foundation for AI initiatives.`;
}

function getGapInsight(dimension: string, score: number, max: number): string {
  const pct = Math.round((score / max) * 100);
  const insights: Record<string, string> = {
    'AI Literacy': `Building AI literacy across leadership is critical. Without understanding AI capabilities and limitations, leaders may struggle to evaluate AI investments effectively or identify high-value use cases. This gap could lead to missed opportunities or misallocated resources.`,
    'Strategy & Vision': `A clearer AI strategy would help prioritise initiatives and align AI investments with business objectives. Without strategic clarity, AI projects may remain siloed and fail to deliver enterprise-wide value.`,
    'Data & Infrastructure': `Strengthening data infrastructure is foundational. Poor data quality or accessibility limits AI system effectiveness and can lead to unreliable outputs that damage trust in AI solutions.`,
    'Culture & Skills': `Building AI skills and cultural readiness is essential for sustainable adoption. Skills gaps can lead to over-reliance on external consultants and slower iteration on AI initiatives.`,
    'Governance & Ethics': `Establishing governance frameworks is increasingly important as AI scales. Without clear guidelines, organisations face regulatory risk, potential reputational damage, and ethical concerns that could hinder AI adoption.`
  };
  return insights[dimension] || `Focus on improving ${dimension} to accelerate AI maturity.`;
}

function generateExecutiveSummary(profile: any, totalScore: number, tier: string, dimensions: any[]): string {
  const name = profile.firstName || 'there';
  const company = profile.company || 'your organisation';
  const industry = profile.industry || 'your industry';
  const country = profile.country || 'your region';
  const seniority = profile.seniority || 'professional';
  const tierName = tier || 'Progressive';
  
  let summary = `## Executive Summary\n\n`;
  summary += `Dear ${name},\n\n`;
  summary += `Thank you for completing the AI Compass Assessment. This comprehensive evaluation of ${company} in the ${industry} sector (${country}) reveals your current AI readiness level and provides a strategic roadmap for your AI transformation journey.\n\n`;
  
  // Overall assessment
  summary += `### Overall Assessment: ${tierName}\n\n`;
  
  if (totalScore >= 81) {
    summary += `Your score of **${totalScore}/100** places you among the leading organisations in AI adoption. ${company} demonstrates exceptional capabilities across most assessment dimensions, with particularly strong performance in strategic AI planning and implementation. Your organisation is well-positioned to drive industry-wide AI transformation and could benefit from exploring advanced AI applications such as generative AI for product innovation, AI-driven decision intelligence, and enterprise-wide AI governance frameworks.\n\n`;
    summary += `As a ${seniority}, you have the opportunity to accelerate your organisation's AI maturity by scaling successful initiatives, investing in AICentre of Excellence, and mentoring peer organisations on their AI journeys.\n\n`;
  } else if (totalScore >= 63) {
    summary += `With a score of **${totalScore}/100**, ${company} demonstrates solid AI foundations and a clear understanding of AI's potential. Your organisation has successfully implemented initial AI projects and is now ready to scale these successes across the enterprise. The key focus areas for the next phase should be: expanding AI use cases beyond pilot programs, strengthening data infrastructure, and developing a comprehensive AI governance framework.\n\n`;
    summary += `For you as a ${seniority}, this represents an exciting inflection point. The decisions you make in the next 6-12 months will determine whether ${company} becomes an industry leader or falls behind competitors who are moving faster on AI adoption.\n\n`;
  } else if (totalScore >= 45) {
    summary += `Your score of **${totalScore}/100** indicates that ${company} is in the developing stage of AI maturity. Your organisation has recognised the importance of AI and has begun initial explorations, but significant work remains to build foundational capabilities. The primary focus should be on establishing clear AI vision, building data infrastructure, and developing internal AI literacy across the leadership team.\n\n`;
    summary += `As a ${seniority}, your role is critical in championing AI adoption. Starting with small, measurable pilot projects that demonstrate quick wins will help build organisational confidence and momentum for larger AI initiatives.\n\n`;
  } else {
    summary += `Your score of **${totalScore}/100** places ${company} at the early stages of AI readiness. This is not a disadvantage—rather, it presents a significant opportunity to build your AI strategy from the ground up with best practices in mind. Starting with a clear assessment of business pain points that AI can address, establishing data foundations, and building leadership AI literacy will set the foundation for successful AI transformation.\n\n`;
    summary += `For you as a ${seniority}, the immediate priority should be education and awareness. Understanding what AI can (and cannot) do for ${company} will help you make informed decisions about where to invest resources.\n\n`;
  }
  
  // Dimension-specific insight
  const sortedDims = [...dimensions].sort((a, b) => b.score - a.score);
  const topDim = sortedDims[0];
  const lowDim = sortedDims[sortedDims.length - 1];
  
  summary += `### Key Insights\n\n`;
  summary += `Your strongest dimension is **${topDim.name}** (${Math.round((topDim.score/topDim.max)*100)}%), demonstrating solid capabilities that provide a strong foundation for AI initiatives. Meanwhile, **${lowDim.name}** (${Math.round((lowDim.score/lowDim.max)*100)}%) represents the area with the greatest opportunity for improvement and should be prioritised in your AI roadmap.\n\n`;
  
  summary += `### Industry Context\n\n`;
  summary += `The ${industry} sector in ${country} is experiencing significant AI-driven transformation. Organisations that act decisively in the next 12-24 months will establish competitive advantages that will be difficult for late-movers to overcome. Your assessment results provide the insights needed to act strategically.\n\n`;
  
  summary += `We encourage you to review the detailed recommendations below and begin your AI transformation journey with confidence.\n\n`;
  
  return summary;
}

function generateOverview(intelligence: any, profile: any): string {
  const company = profile.company || 'Your organisation';
  const industry = profile.industry || 'technology';
  const country = profile.country || 'your region';
  
  let overview = `## Industry & Company Overview\n\n`;
  overview += `This section provides context on ${company} within the ${industry} sector in ${country}, drawing on available intelligence data.\n\n`;
  
  if (intelligence?.companyOverview?.fields) {
    overview += `### Company Profile\n\n`;
    for (const field of intelligence.companyOverview.fields) {
      overview += `**${field.fieldName}**: ${field.fieldValue}\n\n`;
    }
  }
  
  if (intelligence?.companyAIPosture?.fields) {
    overview += `### Current AI Posture\n\n`;
    overview += `Understanding where ${company} stands today is essential for charting the path forward. `;
    for (const field of intelligence.companyAIPosture.fields) {
      overview += `${field.fieldName}: ${field.fieldValue} `;
    }
    overview += `\n\n`;
  }
  
  if (intelligence?.industryAILandscape?.fields) {
    overview += `### Industry Landscape\n\n`;
    overview += `The ${industry} sector is undergoing significant transformation driven by AI technologies. `;
    for (const field of intelligence.industryAILandscape.fields) {
      overview += `**${field.fieldName}**: ${field.fieldValue}\n\n`;
    }
  }
  
  if (intelligence?.regulatoryEnvironment?.fields) {
    overview += `### Regulatory Environment\n\n`;
    overview += `Compliance and regulatory considerations are critical for AI implementation. `;
    for (const field of intelligence.regulatoryEnvironment.fields) {
      overview += `**${field.fieldName}**: ${field.fieldValue}\n\n`;
    }
  }
  
  if (intelligence?.countryAIPolicy?.fields) {
    overview += `### National AI Policy\n\n`;
    for (const field of intelligence.countryAIPolicy.fields) {
      overview += `**${field.fieldName}**: ${field.fieldValue}\n\n`;
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
        description: `Building AI literacy across your leadership team is not just beneficial—it's essential for making informed strategic decisions about AI investments. Without a solid understanding of AI capabilities, limitations, and implications, leaders risk either over-investing in unproven technologies or missing opportunities that competitors are already pursuing. For ${company}, investing in AI education will enable leaders to ask the right questions, evaluate AI proposals critically, and champion AI initiatives throughout the organisation.`,
        whyItMatters: `Leaders who understand AI can better identify high-value use cases, allocate resources effectively, and build organisational confidence in AI initiatives. This creates a ripple effect throughout the organisation.`,
        actions: [
          'Enroll executives in AI strategy programs (MIT Sloan, Stanford AI Executive, or similar)',
          'Schedule quarterly AI trend briefings for leadership to stay current',
          'Create an internal AI champions network to spread knowledge',
          'Bring in external speakers or consultants for perspective',
        ],
        timeline: '3-6 months to establish foundational knowledge',
        impact: 'High - enables better strategic decisions on AI investments',
      });
    }
    
    if (dim.name === 'Strategy & Vision' && percentage < 70) {
      recommendations.push({
        priority: 'high',
        dimension: 'Strategy & Vision',
        title: 'Develop a Comprehensive AI Roadmap',
        description: `Without a clear AI strategy, organisations risk scattered investments that fail to deliver meaningful business value. A comprehensive AI roadmap aligned with ${company}'s business objectives will provide a clear direction for AI initiatives, help prioritise investments, and establish measurable success criteria. This strategic clarity enables leadership to make informed decisions about resource allocation and helps build organisational confidence in AI investments.`,
        whyItMatters: `An AI strategy is not just a technology plan—it's a business strategy that defines how AI will create competitive advantage, improve operations, and drive innovation for ${company}.`,
        actions: [
          'Conduct AI opportunity assessment workshops with key stakeholders',
          'Define clear AI vision and success metrics aligned with business goals',
          'Identify 2-3 quick wins for immediate value demonstration',
          'Create a 3-year AI implementation roadmap with clear milestones',
        ],
        timeline: '1-3 months to develop strategy, 3-year execution horizon',
        impact: 'High - provides direction and prioritisation for all AI initiatives',
      });
    }
    
    if (dim.name === 'Data & Infrastructure' && percentage < 70) {
      recommendations.push({
        priority: 'high',
        dimension: 'Data & Infrastructure',
        title: 'Strengthen Data Foundation',
        description: `AI systems are only as good as the data they operate on. For ${company}, strengthening data infrastructure is foundational to any successful AI initiative. This involves assessing data quality, ensuring data accessibility, establishing governance frameworks, and implementing appropriate security measures. Poor data quality leads to unreliable AI outputs, which can damage trust in AI solutions and slow adoption.`,
        whyItMatters: `Organisations with strong data foundations can deploy AI solutions faster, trust their outputs more readily, and scale successful pilots to production more effectively.`,
        actions: [
          'Conduct a comprehensive data maturity assessment',
          'Implement data quality management processes and standards',
          'Evaluate cloud AI services (AWS, Azure, GCP) for your needs',
          'Establish clear data governance framework and ownership',
          'Ensure data accessibility for AI model training',
        ],
        timeline: '6-12 months for foundational improvements',
        impact: 'High - enables reliable AI outputs and faster deployment',
      });
    }
    
    if (dim.name === 'Culture & Skills' && percentage < 70) {
      recommendations.push({
        priority: 'medium',
        dimension: 'Culture & Skills',
        title: 'Upskill Your Workforce for AI',
        description: `Building AI capabilities within ${company} is essential for sustainable AI adoption. While external consultants can provide initial expertise, building internal capabilities ensures knowledge retention, reduces long-term costs, and creates a culture of AI innovation. AI literacy should extend beyond technical teams to include business functions that will interface with AI systems daily.`,
        whyItMatters: `Organisations with strong internal AI capabilities can iterate faster, maintain knowledge when staff change, and build credibility with employees who see AI as a tool for enhancement rather than replacement.`,
        actions: [
          'Launch targeted AI upskilling programs for relevant teams',
          'Hire or contract AI specialists for key strategic projects',
          'Create internal AI knowledge sharing sessions and communities of practice',
          'Partner with universities for talent pipeline and research collaboration',
          'Identify AI champions in each department to lead adoption',
        ],
        timeline: '6-12 months for meaningful capability building',
        impact: 'Medium to High - builds sustainable internal capability',
      });
    }
    
    if (dim.name === 'Governance & Ethics' && percentage < 70) {
      recommendations.push({
        priority: 'medium',
        dimension: 'Governance & Ethics',
        title: 'Establish AI Governance Framework',
        description: `Implementing responsible AI practices is critical for ${company} as AI adoption scales. Without proper governance, organisations face risks including: biased decision-making, regulatory non-compliance, reputational damage, and unintended negative impacts on stakeholders. A robust AI governance framework establishes clear guidelines for AI development, deployment, and monitoring, ensuring AI systems remain trustworthy and aligned with organisational values.`,
        whyItMatters: `Proactive governance builds trust with customers, regulators, and employees. It also positions ${company} to adapt more quickly as AI regulations evolve globally.`,
        actions: [
          'Define clear AI ethics principles and guidelines for your organisation',
          'Create AI risk assessment processes for all new AI implementations',
          'Establish an AI governance committee with cross-functional representation',
          'Implement clear AI usage policies and training for employees',
          'Set up ongoing monitoring and audit processes for AI systems',
        ],
        timeline: '3-6 months to establish foundational governance',
        impact: 'Medium to High - mitigates risk and builds stakeholder trust',
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
  const name = profile.firstName || 'you';
  
  const nextSteps = [
    `Schedule a strategy session with ${company}'s leadership to discuss these assessment findings and prioritise next steps`,
    `Engage ${name} (assessment participant) as an AI champion to drive internal awareness and momentum`,
    'Prioritise the highest-impact recommendations based on your organisation\'s immediate business goals',
    'Create a 90-day action plan with clear ownership, timelines, and measurable milestones',
    'Establish baseline metrics to track AI readiness progress over time',
    'Consider engaging an AI consultant or advisory firm for targeted implementation support if needed',
    'Schedule a follow-up assessment in 6 months to measure improvement and adjust strategy',
  ];
  
  return nextSteps;
}

function extractHighlights(intelligence: any): any {
  const highlights: any = {};
  
  if (intelligence?.companyAIPosture) {
    highlights.companyAIPosture = intelligence.companyAIPosture.fields.map((f: any) => ({
      name: f.fieldName,
      value: f.fieldValue,
      source: f.source
    }));
  }
  
  if (intelligence?.industryAILandscape) {
    highlights.industryAILandscape = intelligence.industryAILandscape.fields.map((f: any) => ({
      name: f.fieldName,
      value: f.fieldValue,
      source: f.source
    }));
  }
  
  if (intelligence?.countryAIPolicy) {
    highlights.countryAIPolicy = intelligence.countryAIPolicy.fields.map((f: any) => ({
      name: f.fieldName,
      value: f.fieldValue,
      source: f.source
    }));
  }
  
  if (intelligence?.regulatoryEnvironment) {
    highlights.regulatoryEnvironment = intelligence.regulatoryEnvironment.fields.map((f: any) => ({
      name: f.fieldName,
      value: f.fieldValue,
      source: f.source
    }));
  }
  
  if (intelligence?.competitiveIntelligence) {
    highlights.competitiveIntelligence = intelligence.competitiveIntelligence.fields.map((f: any) => ({
      name: f.fieldName,
      value: f.fieldValue,
      source: f.source
    }));
  }
  
  if (intelligence?.aiSkillsMarket) {
    highlights.aiSkillsMarket = intelligence.aiSkillsMarket.fields.map((f: any) => ({
      name: f.fieldName,
      value: f.fieldValue,
      source: f.source
    }));
  }
  
  return highlights;
}
