import { NextResponse } from 'next/server';

// Using OpenAI SDK with DeepSeek
import OpenAI from 'openai';

const deepseek = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY || '',
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { company, industry, country, seniority, firstName, lastName } = body;

    if (!company || !industry) {
      return NextResponse.json({ error: 'Company and industry required' }, { status: 400 });
    }

    const prompt = `Generate comprehensive 12-category AI readiness intelligence for ${company}, a ${seniority || 'executive'} in the ${industry} industry.

Return JSON array with 12 categories. Each: {"name":"category","fields":[{"fieldName":"X","fieldValue":"detailed info","source":"Y"}]}

Categories: professionalProfile, companyOverview, companyAIPosture, industryAILandscape, regulatoryEnvironment, countryAIPolicy, competitiveIntelligence, aiSkillsMarket, technologyStack, peerBenchmarks, recentAIEvents, skillsCredentials.

Each fieldValue: 2-3 sentences with specifics.`;

    const response = await deepseek.chat.completions.create({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const text = response.choices[0]?.message?.content || '';
    
    // Parse JSON
    try {
      const parsed = JSON.parse(text);
      return NextResponse.json(parsed);
    } catch {
      // Try extract JSON
      const match = text.match(/\[[\s\S]*\]/);
      if (match) {
        return NextResponse.json(JSON.parse(match[0]));
      }
      return NextResponse.json({ raw: text });
    }
    
  } catch (error: any) {
    console.error('Intelligence error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
