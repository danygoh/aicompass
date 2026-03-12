import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { company, industry, country } = body;

    const openaiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiKey) {
      return NextResponse.json({ error: 'No OpenAI API key' }, { status: 500 });
    }

    const prompt = `Give me 12 bullet points about AI readiness for ${company} in ${industry}. 
Respond ONLY as JSON array like: [{"category":"name","point":"value"}]`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
      }),
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'OpenAI API failed' }, { status: 500 });
    }

    const data = await response.json();
    const text = data.choices[0].message.content;
    
    return NextResponse.json({ result: text });
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
