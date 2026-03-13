// Static fallback report for when AI fails
export function getFallbackReport(profile: any, totalScore: number, dimensionScores: number[], tier: string): any {
  const dimensions = [
    { name: 'AI Literacy', score: dimensionScores[0] || 0, max: 20 },
    { name: 'Strategy & Vision', score: dimensionScores[1] || 0, max: 20 },
    { name: 'Data & Infrastructure', score: dimensionScores[2] || 0, max: 20 },
    { name: 'Culture & Skills', score: dimensionScores[3] || 0, max: 20 },
    { name: 'Governance & Ethics', score: dimensionScores[4] || 0, max: 20 },
  ];

  const sortedDims = [...dimensions].sort((a, b) => b.score - a.score);
  const strengths = sortedDims.slice(0, 2).map(d => ({
    dimension: d.name,
    score: d.score,
    max: d.max,
    description: `${d.name} is a key strength. Continue building on this foundation.`
  }));
  
  const gaps = sortedDims.slice(-2).map(d => ({
    dimension: d.name,
    score: d.score,
    max: d.max,
    description: `Focus on improving ${d.name} capabilities.`
  }));

  return {
    user: {
      firstName: profile?.firstName || 'User',
      lastName: profile?.lastName || '',
      company: profile?.company || 'Your Organization',
      industry: profile?.industry || 'Your Industry'
    },
    assessment: {
      totalScore,
      dimensionScores,
      tier,
      completedAt: new Date().toISOString()
    },
    executiveSummary: `Based on your assessment, ${profile?.company || 'your organization'} is at the ${tier} level in AI readiness. Your strongest areas are ${strengths.map(s => s.dimension).join(' and ')}. Key areas for improvement include ${gaps.map(g => g.dimension).join(' and ')}.`,
    strengths,
    gaps,
    recommendations: [
      {
        title: 'Build AI Foundations',
        description: 'Start with clear use cases that align to business outcomes.',
        priority: 'high',
        dimension: 'AI Literacy',
        timeline: '30 days',
        impact: 'Foundation for all future AI initiatives'
      },
      {
        title: 'Develop Data Strategy',
        description: 'Ensure data quality, accessibility, and governance.',
        priority: 'medium',
        dimension: 'Data & Infrastructure',
        timeline: '60 days',
        impact: 'Enables AI projects at scale'
      },
      {
        title: 'Upskill Your Team',
        description: 'Invest in AI training for key stakeholders.',
        priority: 'medium',
        dimension: 'Culture & Skills',
        timeline: '90 days',
        impact: 'Builds internal capabilities'
      }
    ],
    nextSteps: [
      'Complete AI readiness assessment',
      'Identify priority use cases',
      'Build business case for AI investment',
      'Assemble cross-functional AI team',
      'Pilot first AI project'
    ],
    intelligence: {},
    dataSource: 'Fallback'
  };
}
