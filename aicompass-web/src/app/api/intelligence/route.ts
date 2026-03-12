import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { company, industry, country, seniority } = body;

    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    
    if (!anthropicKey) {
      return NextResponse.json({ error: 'No API key' }, { status: 500 });
    }

    const prompt = `Generate 12-category AI readiness report for ${company} (${industry}, ${country}). 
Return JSON with categories: professionalProfile, companyOverview, companyAIPosture, industryAILandscape, regulatoryEnvironment, countryAIPolicy, competitiveIntelligence, aiSkillsMarket, technologyStack, peerBenchmarks, recentAIEvents, skillsCredentials.
Each has fields: [{fieldName, fieldValue (2-3 sentences), source}].`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      }),
      signal: AbortSignal.timeout(25000)
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: 'API error: ' + err }, { status: 500 });
    }

    const data = await response.json();
    const text = data.content[0].text;
    
    // Parse JSON from response
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const match = cleaned.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
    
    if (match) {
      return NextResponse.json(JSON.parse(match[0]));
    }
    
    return NextResponse.json({ error: 'Failed to parse' }, { status: 500 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
