import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
    
  if (!anthropicKey) {
    return NextResponse.json({ error: 'No API key' });
  }

  try {
    const body = await request.json();
    const { company, industry, country, seniority } = body;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1500,
        messages: [{
          role: 'user', 
          content: `For ${company} (${industry}, ${country}), give me 12 categories of AI readiness. 
          
Respond ONLY as JSON array like this:
[{"name":"category1","fields":[{"fieldName":"x","fieldValue":"y","source":"z"}]}]

Categories: professionalProfile, companyOverview, companyAIPosture, industryAILandscape, regulatoryEnvironment, countryAIPolicy, competitiveIntelligence, aiSkillsMarket, technologyStack, peerBenchmarks, recentAIEvents, skillsCredentials.`
        }]
      }),
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'API error', status: response.status });
    }

    const data = await response.json();
    const text = data.content[0].text;
    
    // Try parsing
    try {
      return NextResponse.json(JSON.parse(text));
    } catch {
      // Try extracting JSON
      const match = text.match(/\[[\s\S]*\]/);
      if (match) {
        return NextResponse.json(JSON.parse(match[0]));
      }
      return NextResponse.json({ raw: text });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
