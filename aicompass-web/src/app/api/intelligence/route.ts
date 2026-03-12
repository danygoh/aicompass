import { NextResponse } from 'next/server';
import { generateWithFallback } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, company, industry, jobTitle, seniority, department, country } = body;

    if (!company || !industry) {
      return NextResponse.json({ error: 'Company and industry required' }, { status: 400 });
    }

    // Build user context
    const userParts = [firstName, lastName].filter(Boolean).join(' ');
    const userContext = [userParts, jobTitle, seniority, department, company, industry, country].filter(Boolean).join(', ');

    const simpleData: any = await generateWithFallback(userContext);
    
    console.log('Got data:', typeof simpleData, Array.isArray(simpleData));
    
    const categories = [
      'professionalProfile', 'companyOverview', 'companyAIPosture',
      'industryAILandscape', 'regulatoryEnvironment', 'countryAIPolicy',
      'competitiveIntelligence', 'aiSkillsMarket', 'technologyStack',
      'peerBenchmarks', 'recentAIEvents', 'skillsCredentials'
    ];
    
    const intelligence: any = {};
    
    // Handle both object and array responses
    if (simpleData && typeof simpleData === 'object') {
      // If it's an array, convert to object
      let dataObj: any = simpleData;
      if (Array.isArray(simpleData)) {
        dataObj = {};
        for (const item of simpleData) {
          if (item.name) dataObj[item.name] = item;
        }
      }
      
      for (const cat of categories) {
        const keys = Object.keys(dataObj);
        const match = keys.find(k => k.toLowerCase().includes(cat.toLowerCase()) || cat.toLowerCase().includes(k.toLowerCase()));
        const value = match ? dataObj[match] : `${cat} info for ${company}`;
        
        // Handle both string and object values
        let fieldValue = '';
        if (typeof value === 'string') {
          fieldValue = value;
        } else if (value && value.fields && value.fields[0]) {
          fieldValue = value.fields[0].fieldValue || value.fields[0] || JSON.stringify(value);
        } else {
          fieldValue = String(value);
        }
        
        intelligence[cat] = {
          name: cat,
          fields: [{ fieldName: 'Summary', fieldValue: String(fieldValue).substring(0, 250), source: 'AI Analysis' }],
          sources: ['AI Analysis']
        };
      }
    } else {
      throw new Error('Invalid response');
    }
    
    return NextResponse.json(intelligence);
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
