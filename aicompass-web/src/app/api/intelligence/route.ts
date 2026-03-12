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

    const prompt = `You are an expert AI analyst researching ${company}, a ${seniority} in the ${industry} industry operating in ${country}.

Generate a comprehensive 12-category AI readiness intelligence report. This is for strategic planning purposes - be thorough, specific, and actionable.

For each category, provide:
- name: The category identifier
- fields: Array of {fieldName, fieldValue, source} where fieldValue provides detailed, multi-sentence analysis
- sources: Array of source names

CATEGORIES TO COVER:
1. professionalProfile - The individual's background, role, and AI involvement
2. companyOverview - Company size, history, and strategic positioning
3. companyAIPosture - Current AI adoption state, initiatives, and maturity
4. industryAILandscape - How AI is transforming ${industry}, key trends, disruptions
5. regulatoryEnvironment - Relevant AI regulations, compliance requirements in ${country}
6. countryAIPolicy - ${country}'s national AI strategy and government initiatives
7. competitiveIntelligence - What competitors are doing with AI
8. aiSkillsMarket - Talent availability, skill gaps in ${country}/${industry}
9. technologyStack - Current tech infrastructure, readiness for AI
10. peerBenchmarks - How similar companies are performing on AI
11. recentAIEvents - Recent AI news, breakthroughs relevant to ${industry}
12. skillsCredentials - Relevant certifications, training programs

REQUIREMENTS:
- Each fieldValue must be 2-4 substantive sentences with specific details, not generic statements
- Include relevant statistics, percentages, timelines, and concrete examples
- Make insights specifically relevant to ${company} in ${industry} in ${country}
- Prioritise actionable strategic takeaways over generic observations
- Identify risks and opportunities specific to their situation
- Provide competitive context where relevant

Return valid JSON only.`;

    const text = await generateWithFallback(prompt);
    
    // Clean up any markdown code blocks
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let intelligence;
    try {
      intelligence = JSON.parse(cleaned);
    } catch {
      // Try to extract JSON from response
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
