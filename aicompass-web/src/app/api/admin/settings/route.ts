import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET all settings
export async function GET() {
  try {
    const settings = await prisma.settings.findMany();
    
    // Convert to key-value object
    const result: any = {};
    settings.forEach(s => {
      result[s.key] = s.value;
    });
    
    return NextResponse.json({ settings: result });
  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

// PUT - update a setting
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { key, value, description } = body;
    
    if (!key) {
      return NextResponse.json({ error: 'Key required' }, { status: 400 });
    }
    
    const setting = await prisma.settings.upsert({
      where: { key },
      update: { value, description },
      create: { key, value, description: description || '' },
    });
    
    return NextResponse.json({ setting });
  } catch (error) {
    console.error('Settings PUT error:', error);
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 });
  }
}
