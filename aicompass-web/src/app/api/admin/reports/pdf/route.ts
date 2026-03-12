import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import PDFReportDocument from '@/components/PDFReport';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { report } = body;
    
    if (!report) {
      return NextResponse.json({ error: 'Report data required' }, { status: 400 });
    }

    // Generate PDF
    const pdfBuffer = await renderToBuffer(<PDFReportDocument report={report} />);
    
    // Return as base64
    return NextResponse.json({
      pdf: pdfBuffer.toString('base64'),
      filename: `AI-Compass-Report-${(report.userName || 'User').replace(/\s+/g, '-')}-${new Date(report.completedAt || Date.now()).toISOString().split('T')[0]}.pdf`,
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
