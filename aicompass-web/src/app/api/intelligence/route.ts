import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const openaiKey = process.env.OPENAI_API_KEY;
    
  if (!openaiKey) {
    return NextResponse.json({ error: 'No OpenAI key' });
  }

  try {
    const body = await request.json();
    const { company, industry, country, seniority } = body;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'user', 
          content: `Generate 12-category AI readiness report for ${company} (${industry}, ${country}). 

Return as JSON with categories: professionalProfile, companyOverview, companyAIPosture, industryAILandscape, regulatoryEnvironment, countryAIPolicy, competitiveIntelligence, aiSkillsMarket, technologyStack, peerBenchmarks, recentAIEvents, skillsCredentials.

Format each as: {"name":"category","fields":[{"fieldName":"X","fieldValue":"2-3 sentences","source":"Y"}],"sources":["Z"]}`}],
        max_tokens: 1500,
      }),
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'OpenAI error', status: response.status });
    }

    const data = await response.json();
    const text = data.choices[0].message.content;
    
    // Try parse JSON
    try {
      const json = JSON.parse(text);
      return NextResponse.json(json);
    } catch {
      return NextResponse.json({ text: text });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
