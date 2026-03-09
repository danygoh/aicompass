import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';

// PDF Document Component (inline to avoid import issues)
const PDFStyles = {
  page: {
    padding: 40,
    fontSize: 10,
    backgroundColor: '#fff'
  },
  header: {
    marginBottom: 20,
    borderBottom: '2 solid #C17F24',
    paddingBottom: 15
  },
  brand: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 4
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0B1F3A',
    marginBottom: 4
  },
  role: {
    fontSize: 11,
    color: '#4a5568',
    marginBottom: 8
  },
  section: {
    marginBottom: 15,
    padding: 12,
    border: '1 solid #eef1f6',
    borderRadius: 8
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0B1F3A',
    marginBottom: 8
  },
  text: {
    color: '#4a5568',
    lineHeight: 1.5
  }
};

async function generatePDF(data: any) {
  const { Page, Text, View, Document } = await import('@react-pdf/renderer');
  
  const doc = (
    <Document>
      <Page size="A4" style={PDFStyles.page}>
        <View style={PDFStyles.header}>
          <Text style={PDFStyles.brand}>AI Native Foundation · AI Compass</Text>
          <Text style={PDFStyles.name}>{data.profile?.firstName} {data.profile?.lastName}</Text>
          <Text style={PDFStyles.role}>{data.profile?.jobTitle} at {data.profile?.company}</Text>
        </View>
        
        <View style={{ marginBottom: 20, padding: 15, backgroundColor: '#F3F6FA', borderRadius: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 4 }}>
            Your AI Readiness Score: {data.totalScore}/100
          </Text>
          <Text style={{ fontSize: 12, color: '#C17F24' }}>{data.tier} Level</Text>
        </View>

        <View style={PDFStyles.section}>
          <Text style={PDFStyles.sectionTitle}>5-Dimension Breakdown</Text>
          {['AI Literacy', 'Strategy & Vision', 'Data & Infrastructure', 'Culture & Skills', 'Governance & Ethics'].map((dim, idx) => (
            <View key={idx} style={{ flexDirection: 'row', marginVertical: 3 }}>
              <Text style={{ width: 120, fontSize: 9 }}>{dim}</Text>
              <Text style={{ fontSize: 9 }}>{data.dimensionScores?.[idx] || 0}/20</Text>
            </View>
          ))}
        </View>

        <View style={PDFStyles.section}>
          <Text style={PDFStyles.sectionTitle}>Executive Summary</Text>
          <Text style={PDFStyles.text}>
            Based on your assessment, you are at the {data.tier} level with a score of {data.totalScore}/100.
          </Text>
        </View>
      </Page>
    </Document>
  );

  return renderToBuffer(doc);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { profile, totalScore, tier, dimensionScores } = body;

    if (!profile || !totalScore) {
      return NextResponse.json(
        { error: 'Missing required data' },
        { status: 400 }
      );
    }

    const pdfBuffer = await generatePDF({
      profile,
      totalScore,
      tier: tier || 'Progressive',
      dimensionScores: dimensionScores || [0, 0, 0, 0, 0]
    });

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="AI-Compass-Report-${profile.lastName || 'Report'}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF: ' + error.message },
      { status: 500 }
    );
  }
}
