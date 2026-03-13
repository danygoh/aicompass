import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';

async function generatePDF(data: any) {
  const { Page, Text, View, Document, StyleSheet } = await import('@react-pdf/renderer');
  
  const styles = StyleSheet.create({
    page: { padding: 40, fontSize: 10, backgroundColor: '#fff' },
    header: { marginBottom: 20, borderBottom: '2 solid #C17F24', paddingBottom: 15 },
    brand: { fontSize: 12, color: '#718096', marginBottom: 4 },
    name: { fontSize: 20, fontWeight: 'bold', color: '#0B1F3A', marginBottom: 4 },
    role: { fontSize: 11, color: '#4a5568', marginBottom: 8 },
    section: { marginBottom: 15, padding: 12, border: '1 solid #eef1f6', borderRadius: 8 },
    sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#0B1F3A', marginBottom: 8 },
    text: { color: '#4a5568', lineHeight: 1.5 },
    scoreBox: { marginBottom: 20, padding: 15, backgroundColor: '#F3F6FA', borderRadius: 8 },
    score: { fontSize: 24, fontWeight: 'bold', color: '#0B1F3A' },
    tier: { fontSize: 12, color: '#C17F24' },
    toc: { marginBottom: 20 },
    tocTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 10, color: '#0B1F3A' },
    tocItem: { fontSize: 10, marginBottom: 4, color: '#4a5568' },
    footer: { position: 'absolute', bottom: 20, left: 40, right: 40, textAlign: 'center', fontSize: 8, color: '#a0aec0' },
    executivePage: { padding: 40 },
    execTitle: { fontSize: 18, fontWeight: 'bold', color: '#0B1F3A', marginBottom: 15 },
    execSubtitle: { fontSize: 12, color: '#718096', marginBottom: 20 },
    dimensionRow: { flexDirection: 'row', marginVertical: 3 },
    dimensionLabel: { width: 140, fontSize: 9 },
    dimensionScore: { fontSize: 9 },
    recItem: { marginBottom: 8, padding: 8, backgroundColor: '#F9FAFB', borderRadius: 4 },
    recTitle: { fontSize: 10, fontWeight: 'bold', color: '#0B1F3A', marginBottom: 4 },
    recText: { fontSize: 9, color: '#4a5568' },
  });

  const doc = (
    <Document>
      {/* Page 1: Cover & Executive Summary */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.brand}>🤖 AI Native Foundation · AI Compass</Text>
          <Text style={styles.name}>{data.profile?.firstName} {data.profile?.lastName}</Text>
          <Text style={styles.role}>{data.profile?.jobTitle} at {data.profile?.company}</Text>
        </View>
        
        {/* Score Box */}
        <View style={styles.scoreBox}>
          <Text style={styles.score}>Your Score: {data.totalScore}/100</Text>
          <Text style={styles.tier}>{data.tier} Level</Text>
        </View>

        {/* Table of Contents */}
        <View style={styles.toc}>
          <Text style={styles.tocTitle}>📋 Report Contents</Text>
          <Text style={styles.tocItem}>1. Executive Summary</Text>
          <Text style={styles.tocItem}>2. 5-Dimension Score Analysis</Text>
          <Text style={styles.tocItem}>3. Strengths & Gaps</Text>
          <Text style={styles.tocItem}>4. Personalized Recommendations</Text>
          <Text style={styles.tocItem}>5. Next Steps</Text>
          <Text style={styles.tocItem}>6. Intelligence Highlights</Text>
          <Text style={styles.tocItem}>7. 30-60-90 Day Plan</Text>
        </View>

        {/* Executive Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Executive Summary</Text>
          <Text style={styles.text}>
            {data.executiveSummary || `Dear ${data.profile?.firstName || 'there'}, thank you for completing the AI Compass Assessment. 
            
Your score of ${data.totalScore}/100 places your organisation at the ${data.tier} level of AI readiness. This comprehensive report provides insights into your AI maturity across five key dimensions and personalized recommendations for your AI transformation journey.`}
          </Text>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>AI Compass Report · Generated {new Date().toLocaleDateString()} · Page 1</Text>
      </Page>

      {/* Page 2: Dimensions & Findings */}
      <Page size="A4" style={styles.page}>
        <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 15, color: '#0B1F3A' }}>2. 5-Dimension Score Analysis</Text>
        
        <View style={styles.section}>
          {['AI Literacy', 'Strategy & Vision', 'Data & Infrastructure', 'Culture & Skills', 'Governance & Ethics'].map((dim, idx) => (
            <View key={idx} style={styles.dimensionRow}>
              <Text style={styles.dimensionLabel}>{dim}</Text>
              <Text style={styles.dimensionScore}>{data.dimensionScores?.[idx] || 0}/20</Text>
            </View>
          ))}
        </View>

        <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 15, marginTop: 20, color: '#0B1F3A' }}>3. Strengths & Gaps</Text>
        
        <View style={styles.section}>
          <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#38A169', marginBottom: 8 }}>Strengths</Text>
          {(data.findings?.strengths || []).map((s: any, i: number) => (
            <Text key={i} style={{ fontSize: 9, marginBottom: 4 }}>• {s.dimension}: {s.percentage}%</Text>
          ))}
        </View>
        
        <View style={styles.section}>
          <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#E53E3E', marginBottom: 8 }}>Areas for Improvement</Text>
          {(data.findings?.gaps || []).map((g: any, i: number) => (
            <Text key={i} style={{ fontSize: 9, marginBottom: 4 }}>• {g.dimension}: {g.percentage}%</Text>
          ))}
        </View>

        <Text style={styles.footer}>AI Compass Report · Page 2</Text>
      </Page>

      {/* Page 3: Recommendations */}
      <Page size="A4" style={styles.page}>
        <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 15, color: '#0B1F3A' }}>4. Personalized Recommendations</Text>
        
        {(data.recommendations || []).slice(0, 4).map((rec: any, idx: number) => (
          <View key={idx} style={styles.recItem}>
            <Text style={styles.recTitle}>{idx + 1}. {rec.title}</Text>
            <Text style={styles.recText}>{rec.description}</Text>
            {rec.actions && <Text style={{ fontSize: 8, marginTop: 4, color: '#718096' }}>Actions: {rec.actions.join(' → ')}</Text>}
          </View>
        ))}

        <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 15, marginTop: 20, color: '#0B1F3A' }}>5. Next Steps</Text>
        
        {(data.nextSteps || []).slice(0, 5).map((step: string, idx: number) => (
          <Text key={idx} style={{ fontSize: 9, marginBottom: 4 }}>{idx + 1}. {step}</Text>
        ))}

        <Text style={styles.footer}>AI Compass Report · Page 3</Text>
      </Page>

      {/* Page 4: Plan & Intelligence */}
      <Page size="A4" style={styles.page}>
        <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 15, color: '#0B1F3A' }}>6. Intelligence Highlights</Text>
        
        {Object.keys(data.intelligence || {}).slice(0, 4).map((key, idx) => (
          <View key={idx} style={{ marginBottom: 10 }}>
            <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#C17F24', marginBottom: 4 }}>{key}</Text>
            <Text style={{ fontSize: 9, color: '#4a5568' }}>
              {(data.intelligence[key] || []).slice(0, 2).map((f: any) => f.value?.substring(0, 100)).join(' ')}
            </Text>
          </View>
        ))}

        <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 15, marginTop: 20, color: '#0B1F3A' }}>7. 30-60-90 Day Plan</Text>
        
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1, padding: 10, backgroundColor: '#F0FFF4', borderRadius: 4 }}>
            <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#276749', marginBottom: 4 }}>30 Days</Text>
            <Text style={{ fontSize: 8 }}>• Assessment{'\n'}• Quick wins{'\n'}• Team alignment</Text>
          </View>
          <View style={{ flex: 1, padding: 10, backgroundColor: '#EBF8FF', borderRadius: 4 }}>
            <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#2B6CB0', marginBottom: 4 }}>60 Days</Text>
            <Text style={{ fontSize: 8 }}>• Pilots{'\n'}• Training{'\n'}• Metrics</Text>
          </View>
          <View style={{ flex: 1, padding: 10, backgroundColor: '#FAF5FF', borderRadius: 4 }}>
            <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#6B46C1', marginBottom: 4 }}>90 Days</Text>
            <Text style={{ fontSize: 8 }}>• Scale{'\n'}• Evaluate{'\n'}• Plan next</Text>
          </View>
        </View>

        <Text style={styles.footer}>AI Compass Report · Generated {new Date().toLocaleDateString()} · Page 4</Text>
      </Page>
    </Document>
  );

  return renderToBuffer(doc);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { profile, totalScore, tier, dimensionScores, executiveSummary, findings, recommendations, nextSteps, intelligence } = body;

    if (!profile || !totalScore) {
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 });
    }

    const pdfBuffer = await generatePDF({
      profile,
      totalScore,
      tier: tier || 'Progressive',
      dimensionScores: dimensionScores || [0, 0, 0, 0, 0],
      executiveSummary,
      findings,
      recommendations,
      nextSteps,
      intelligence
    });

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="AI-Compass-Report-${profile.lastName || 'Report'}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('PDF generation error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF: ' + error.message }, { status: 500 });
  }
}
