import { NextResponse } from 'next/server';
import { generateWithFallback } from '@/lib/ai';

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

    const prompt = `You are an expert AI analyst researching ${company}, a ${seniority || 'executive'} in the ${industry} industry operating in ${country || 'global'}.

Generate a comprehensive 12-category AI readiness intelligence report. Be thorough, specific, and actionable.

For each category, provide:
- name: The category identifier  
- fields: Array of {fieldName, fieldValue, source} where fieldValue provides 2-4 detailed sentences
- sources: Array of source names

CATEGORIES:
1. professionalProfile - The individual's background and AI involvement
2. companyOverview - Company size, history, strategic positioning
3. companyAIPosture - Current AI adoption state and maturity
4. industryAILandscape - How AI is transforming this industry
5. regulatoryEnvironment - Relevant AI regulations and compliance
6. countryAIPolicy - National AI strategy and government initiatives
7. competitiveIntelligence - What competitors are doing with AI
8. aiSkillsMarket - Talent availability and skill gaps
9. technologyStack - Current tech infrastructure readiness
10. peerBenchmarks - How similar companies are performing
11. recentAIEvents - Recent AI news relevant to this industry
12. skillsCredentials - Relevant certifications and training programs

REQUIREMENTS:
- Each fieldValue must be 2-4 substantive sentences with specific details
- Include relevant statistics, percentages, timelines
- Make insights specifically relevant to ${company} in ${industry}
- Prioritise actionable strategic takeaways

Return valid JSON only.`;

    const text = await generateWithFallback(prompt);
    
    // Parse JSON
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    let intelligence;
    
    try {
      intelligence = JSON.parse(cleaned);
    } catch {
      const match = cleaned.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
      if (match) {
        intelligence = JSON.parse(match[0]);
      } else {
        throw new Error('Failed to parse AI response');
      }
    }
    
    return NextResponse.json(intelligence);
  } catch (error: any) {
    console.error('Intelligence error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate intelligence' },
      { status: 500 }
    );
  }
}
