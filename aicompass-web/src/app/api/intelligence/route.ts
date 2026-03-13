import { NextResponse } from 'next/server';
import { generateWithFallback } from '@/lib/ai';
import { getFallbackIntelligence } from '@/lib/fallback-intelligence';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, company, industry, jobTitle, seniority, department, country, assessmentId } = body;

    if (!company || !industry) {
      return NextResponse.json({ error: 'Company and industry required' }, { status: 400 });
    }

    // Build user context
    const userParts = [firstName, lastName].filter(Boolean).join(' ');
    const userContext = [userParts, jobTitle, seniority, department, company, industry, country].filter(Boolean).join(', ');

    let simpleData: any;
    let dataSource = 'AI';
    
    try {
      simpleData = await generateWithFallback(userContext);
      console.log('Got data from AI:', typeof simpleData, typeof simpleData === 'string' ? simpleData.substring(0, 50) : '');
      
      // If AI returned string instead of object, try to parse or use fallback
      if (typeof simpleData === 'string') {
        console.log('AI returned string, attempting parse...');
        try {
          // Try to extract JSON from the string (might be wrapped in ```json)
          const jsonMatch = simpleData.match(/```json\n?([\s\S]*?)\n?```/);
          if (jsonMatch) {
            simpleData = JSON.parse(jsonMatch[1]);
            console.log('Parsed JSON from string');
          } else {
            simpleData = JSON.parse(simpleData);
          }
        } catch (parseErr) {
          console.log('Could not parse string, using fallback');
          simpleData = getFallbackIntelligence(company);
          dataSource = 'Fallback';
        }
      }
    } catch (aiError: any) {
      console.error('AI generation failed:', aiError.message);
      // Use fallback
      simpleData = getFallbackIntelligence(company);
      dataSource = 'Fallback';
    }
    
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
          fields: [{ fieldName: 'Summary', fieldValue: String(fieldValue).substring(0, 250), source: dataSource + ' Analysis' }],
          sources: [dataSource + ' Analysis']
        };
      }
    } else {
      // Use fallback if AI response is invalid
      const fallback = getFallbackIntelligence(company);
      Object.assign(intelligence, fallback);
      dataSource = 'Fallback';
    }
    
    // Save to DB if assessmentId provided
    if (assessmentId) {
      try {
        await prisma.assessment.update({
          where: { id: assessmentId },
          data: {
            intelligence: intelligence,
            intelligenceSource: dataSource
          }
        });
      } catch (dbError) {
        console.error('Failed to cache intelligence:', dbError);
      }
    }
    
    // Return with source indicator
    return NextResponse.json({
      intelligence,
      dataSource,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error:', error);
    // Return fallback on any error
    const fallback = getFallbackIntelligence();
    return NextResponse.json({
      intelligence: fallback,
      dataSource: 'Fallback',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
