import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
    
  if (!anthropicKey) {
    return NextResponse.json({ error: 'No key' });
  }

  try {
    const body = await request.json();
    const { company, industry } = body;

    // Super simple request
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 300,
        messages: [{ role: 'user', content: `List 5 key AI trends for ${company} in ${industry}.` }]
      }),
      signal: AbortSignal.timeout(8000)
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Anthropic error', status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ result: data.content[0].text });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
