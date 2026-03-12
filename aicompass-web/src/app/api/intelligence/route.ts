import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { company, industry, country } = body;

    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    
    if (!anthropicKey) {
      return NextResponse.json({ error: 'No API key configured' }, { status: 500 });
    }

    const prompt = `Return ONLY valid JSON for AI readiness report for ${company} (${industry}, ${country}).

JSON format exactly:
{"professionalProfile":{"name":"professionalProfile","fields":[{"fieldName":"Role","fieldValue":"Detailed description here.","source":"Source"}],"sources":["Source"]}}

12 categories: professionalProfile, companyOverview, companyAIPosture, industryAILandscape, regulatoryEnvironment, countryAIPolicy, competitiveIntelligence, aiSkillsMarket, technologyStack, peerBenchmarks, recentAIEvents, skillsCredentials.

Each field: 2-3 sentences. Valid JSON only.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2500,
        messages: [{ role: 'user', content: prompt }],
      }),
      signal: AbortSignal.timeout(30000)
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: 'API failed', details: err }, { status: 500 });
    }

    const data = await response.json();
    const text = data.content[0].text;
    
    // Try to find JSON in response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return NextResponse.json(parsed);
      } catch {}
    }
    
    // If still fails, return raw text
    return NextResponse.json({ 
      message: "Data generated but parsing failed",
      raw: text.substring(0, 1000) 
    });
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
