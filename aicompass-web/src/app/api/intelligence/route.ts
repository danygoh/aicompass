import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { company, industry, country, seniority, firstName, lastName } = body;

    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    
    if (!anthropicKey) {
      return NextResponse.json({ error: 'No API key' }, { status: 500 });
    }

    const prompt = `Generate a comprehensive 12-category AI readiness intelligence report for ${company || 'the company'}, a ${seniority || 'executive'} in the ${industry || 'technology'} industry.

Return ONLY valid JSON (no markdown, no explanations). Format:
{
  "professionalProfile": {"name": "professionalProfile", "fields": [{"fieldName": "...", "fieldValue": "...", "source": "..."}], "sources": ["..."]},
  "companyOverview": {"name": "companyOverview", "fields": [...], "sources": [...]},
  ... (all 12 categories)
}

Categories: professionalProfile, companyOverview, companyAIPosture, industryAILandscape, regulatoryEnvironment, countryAIPolicy, competitiveIntelligence, aiSkillsMarket, technologyStack, peerBenchmarks, recentAIEvents, skillsCredentials.

Each fieldValue must be 2-3 detailed sentences.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
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
    
    // Try to extract JSON
    let intelligence = null;
    
    // Try direct parse first
    try {
      intelligence = JSON.parse(text);
    } catch {
      // Try extracting JSON from markdown
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          intelligence = JSON.parse(jsonMatch[0]);
        } catch {
          // Try finding array
          const arrayMatch = text.match(/\[[\s\S]*\]/);
          if (arrayMatch) {
            try {
              const parsed = JSON.parse(arrayMatch[0]);
              // Convert array to object if needed
              if (Array.isArray(parsed)) {
                intelligence = parsed.reduce((acc: any, item: any) => {
                  if (item.name) acc[item.name] = item;
                  return acc;
                }, {});
              }
            } catch {}
          }
        }
      }
    }
    
    if (!intelligence || typeof intelligence !== 'object') {
      // Last resort - return the raw text as error with context
      return NextResponse.json({ 
        error: 'Failed to parse AI response',
        raw: text.substring(0, 500)
      }, { status: 500 });
    }
    
    return NextResponse.json(intelligence);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
