import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { company, industry, country } = body;

    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    
    if (!anthropicKey) {
      return NextResponse.json({ error: 'No API key' }, { status: 500 });
    }

    // Simpler, faster prompt
    const prompt = `Give me 12 bullet points about AI readiness for ${company} in ${industry}. 
Respond ONLY as JSON array: [{"category":"name","fields":[{"field":"x","value":"y"}]}`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307', // Fastest model
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }],
      }),
      signal: AbortSignal.timeout(15000) // 15s timeout
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'API failed' }, { status: 500 });
    }

    const data = await response.json();
    const text = data.content[0].text;
    
    return NextResponse.json({ raw: text });
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
