import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// Register fonts
Font.register({
  family: 'DM Sans',
  src: 'https://fonts.gstatic.com/s/dmsans/v14/rP2tp2ywxg089UriI5-g4vlH9Wh8yRc4Q.ttf'
});

// Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'DM Sans',
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
  meta: {
    fontSize: 9,
    color: '#718096'
  },
  scoreSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#F3F6FA',
    borderRadius: 8
  },
  scoreCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    border: '4 solid #C17F24',
    alignItems: 'center',
    justifyContent: 'center'
  },
  scoreText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0B1F3A'
  },
  scoreLabel: {
    fontSize: 8,
    color: '#718096'
  },
  tier: {
    fontSize: 12,
    padding: '6 12',
    backgroundColor: '#C17F24',
    color: '#fff',
    borderRadius: 4
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
    marginBottom: 8,
    paddingBottom: 6,
    borderBottom: '1 solid #eef1f6'
  },
  text: {
    color: '#4a5568',
    lineHeight: 1.5,
    marginBottom: 6
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4
  },
  label: {
    color: '#718096',
    fontSize: 9
  },
  value: {
    color: '#0B1F3A',
    fontWeight: 'medium'
  },
  dimensionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3
  },
  dimName: {
    width: 120,
    fontSize: 9,
    color: '#4a5568'
  },
  dimBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#eef1f6',
    borderRadius: 3,
    marginHorizontal: 8
  },
  dimFill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#006D6B'
  },
  dimScore: {
    width: 30,
    fontSize: 9,
    color: '#0B1F3A',
    textAlign: 'right'
  },
  recommendation: {
    padding: 10,
    backgroundColor: '#fdf3e3',
    borderRadius: 6,
    marginBottom: 8,
    borderLeft: '3 solid #C17F24'
  },
  recTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0B1F3A',
    marginBottom: 4
  },
  recText: {
    fontSize: 9,
    color: '#4a5568',
    lineHeight: 1.4
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTop: '1 solid #eef1f6',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  footerText: {
    fontSize: 8,
    color: '#718096'
  }
});

interface ReportPDFProps {
  profile: {
    firstName: string;
    lastName: string;
    jobTitle: string;
    company: string;
    industry: string;
    country: string;
  };
  totalScore: number;
  tier: string;
  dimensionScores: number[];
  recommendations?: any[];
}

export const ReportPDF: React.FC<ReportPDFProps> = ({
  profile,
  totalScore,
  tier,
  dimensionScores,
  recommendations = []
}) => {
  const dimensions = [
    { name: 'AI Literacy', score: dimensionScores[0] || 0 },
    { name: 'Strategy & Vision', score: dimensionScores[1] || 0 },
    { name: 'Data & Infrastructure', score: dimensionScores[2] || 0 },
    { name: 'Culture & Skills', score: dimensionScores[3] || 0 },
    { name: 'Governance & Ethics', score: dimensionScores[4] || 0 }
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.brand}>AI Native Foundation · AI Compass</Text>
          <Text style={styles.name}>{profile.firstName} {profile.lastName}</Text>
          <Text style={styles.role}>{profile.jobTitle} at {profile.company}</Text>
          <Text style={styles.meta}>
            {profile.industry} · {profile.country} · {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </Text>
        </View>

        {/* Score Section */}
        <View style={styles.scoreSection}>
          <View>
            <Text style={{ fontSize: 14, color: '#0B1F3A', marginBottom: 4 }}>Your AI Readiness Score</Text>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#0B1F3A' }}>{totalScore}/100</Text>
            <Text style={{ fontSize: 10, color: '#718096' }}>{tier} Level</Text>
          </View>
          <View style={styles.tier}>
            <Text style={{ color: '#fff', fontWeight: 'bold' }}>{tier}</Text>
          </View>
        </View>

        {/* Dimension Scores */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5-Dimension Breakdown</Text>
          {dimensions.map((dim, idx) => (
            <View key={idx} style={styles.dimensionBar}>
              <Text style={styles.dimName}>{dim.name}</Text>
              <View style={styles.dimBar}>
                <View style={[styles.dimFill, { width: `${(dim.score / 20) * 100}%` }]} />
              </View>
              <Text style={styles.dimScore}>{dim.score}/20</Text>
            </View>
          ))}
        </View>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Recommendations</Text>
            {recommendations.slice(0, 3).map((rec: any, idx: number) => (
              <View key={idx} style={styles.recommendation}>
                <Text style={styles.recTitle}>{rec.title}</Text>
                <Text style={styles.recText}>{rec.description}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Executive Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Executive Summary</Text>
          <Text style={styles.text}>
            Based on your assessment across 5 key dimensions, you are at the {tier} level of AI readiness with a score of {totalScore}/100.
            {totalScore >= 63 
              ? ' You demonstrate solid understanding and practical experience with AI tools.' 
              : totalScore >= 45
                ? ' You have foundational knowledge but there are clear areas for improvement.'
                : ' You are at the beginning of your AI journey with significant opportunities to develop.'}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>© AI Native Foundation · AI Compass</Text>
          <Text style={styles.footerText}>Confidential</Text>
        </View>
      </Page>
    </Document>
  );
};
