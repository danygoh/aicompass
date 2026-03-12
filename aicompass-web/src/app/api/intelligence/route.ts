import { NextResponse } from 'next/server';
import { generateWithFallback } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { company, industry } = body;

    if (!company || !industry) {
      return NextResponse.json({ error: 'Company and industry required' }, { status: 400 });
    }

    // Get simple key-value data
    const simpleData: any = await generateWithFallback(`${company} in ${industry}`);
    
    console.log('Got data type:', typeof simpleData);
    console.log('Keys:', Object.keys(simpleData || {}));
    
    // Expand to full 12-category format
    const categories = [
      'professionalProfile', 'companyOverview', 'companyAIPosture',
      'industryAILandscape', 'regulatoryEnvironment', 'countryAIPolicy',
      'competitiveIntelligence', 'aiSkillsMarket', 'technologyStack',
      'peerBenchmarks', 'recentAIEvents', 'skillsCredentials'
    ];
    
    const intelligence: any = {};
    
    // If we got a simple object, expand each
    if (simpleData && typeof simpleData === 'object') {
      for (const cat of categories) {
        // Try to find matching key (case insensitive)
        const keys = Object.keys(simpleData);
        const match = keys.find(k => k.toLowerCase().includes(cat.toLowerCase()) || cat.toLowerCase().includes(k.toLowerCase()));
        const value = match ? simpleData[match] : `${cat} information for ${company}`;
        
        intelligence[cat] = {
          name: cat,
          fields: [{ fieldName: 'Summary', fieldValue: String(value).substring(0, 200), source: 'AI Analysis' }],
          sources: ['AI Analysis']
        };
      }
    } else {
      throw new Error('No data returned');
    }
    
    return NextResponse.json(intelligence);
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
