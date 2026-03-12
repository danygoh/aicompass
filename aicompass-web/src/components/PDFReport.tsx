import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register fonts
Font.register({
  family: 'Helvetica',
  fonts: [{ src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Mu4mxP.ttf', fontWeight: 'normal' }],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 11,
    lineHeight: 1.5,
    color: '#1e3a5f',
  },
  header: {
    borderBottomWidth: 2,
    borderBottomColor: '#f59e0b',
    paddingBottom: 10,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e3a5f',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: '#6b7280',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0d9488',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 4,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  label: {
    width: 120,
    color: '#6b7280',
    fontSize: 10,
  },
  value: {
    flex: 1,
    color: '#1e3a5f',
    fontSize: 11,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  score: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#f59e0b',
    marginRight: 15,
  },
  tierBadge: {
    backgroundColor: '#f0fdfa',
    color: '#0d9488',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 10,
    fontWeight: 'bold',
  },
  dimensionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dimensionName: {
    width: 150,
    fontSize: 10,
  },
  dimensionScore: {
    width: 50,
    fontSize: 10,
    fontWeight: 'bold',
  },
  dimensionBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginHorizontal: 8,
  },
  dimensionFill: {
    height: 8,
    backgroundColor: '#0d9488',
    borderRadius: 4,
  },
  recommendation: {
    backgroundColor: '#f9fafb',
    borderLeftWidth: 3,
    borderLeftColor: '#0d9488',
    padding: 10,
    marginBottom: 10,
  },
  recTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1e3a5f',
    marginBottom: 4,
  },
  recPriority: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  recText: {
    fontSize: 10,
    color: '#374151',
    marginBottom: 6,
  },
  recActions: {
    fontSize: 9,
    color: '#6b7280',
    paddingLeft: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: '#9ca3af',
    textAlign: 'center',
  },
});

interface PDFReportProps {
  report: {
    userName: string;
    email: string;
    company: string;
    industry: string;
    totalScore: number;
    tier: string;
    dimensionScores?: number[];
    completedAt?: string;
    reportData?: {
      executiveSummary?: string;
      recommendations?: any[];
      nextSteps?: string[];
      findings?: { overview?: string };
    };
  };
}

export const PDFReportDocument: React.FC<PDFReportProps> = ({ report }) => {
  const rd = report.reportData || {};
  const dimensions = [
    { name: 'AI Literacy', score: report.dimensionScores?.[0] || 0 },
    { name: 'Strategy & Vision', score: report.dimensionScores?.[1] || 0 },
    { name: 'Data & Infrastructure', score: report.dimensionScores?.[2] || 0 },
    { name: 'Culture & Skills', score: report.dimensionScores?.[3] || 0 },
    { name: 'Governance & Ethics', score: report.dimensionScores?.[4] || 0 },
  ];

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🤖 AI Compass Assessment Report</Text>
          <Text style={styles.subtitle}>
            Generated: {report.completedAt ? new Date(report.completedAt).toLocaleDateString() : new Date().toLocaleDateString()}
          </Text>
        </View>

        {/* User Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Information</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{report.userName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{report.email}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Company</Text>
            <Text style={styles.value}>{report.company || 'Not specified'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Industry</Text>
            <Text style={styles.value}>{report.industry || 'Not specified'}</Text>
          </View>
        </View>

        {/* Score */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assessment Results</Text>
          <View style={styles.scoreContainer}>
            <Text style={styles.score}>{report.totalScore || 0}</Text>
            <View>
              <Text style={{ fontSize: 10, color: '#6b7280', marginBottom: 4 }}>out of 100</Text>
              <Text style={styles.tierBadge}>{report.tier || 'Beginner'}</Text>
            </View>
          </View>
        </View>

        {/* Dimensions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dimension Scores</Text>
          {dimensions.map((dim, i) => (
            <View key={i} style={styles.dimensionRow}>
              <Text style={styles.dimensionName}>{dim.name}</Text>
              <Text style={styles.dimensionScore}>{dim.score}/20</Text>
              <View style={styles.dimensionBar}>
                <View style={[styles.dimensionFill, { width: `${(dim.score / 20) * 100}%` }]} />
              </View>
            </View>
          ))}
        </View>

        {/* Executive Summary */}
        {rd.executiveSummary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Executive Summary</Text>
            <Text style={{ fontSize: 10, color: '#374151', lineHeight: 1.6 }}>
              {rd.executiveSummary.replace(/\n\n/g, '\n').substring(0, 1000)}
            </Text>
          </View>
        )}

        {/* Recommendations */}
        {rd.recommendations && rd.recommendations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommendations</Text>
            {rd.recommendations.slice(0, 5).map((rec: any, i: number) => (
              <View key={i} style={styles.recommendation}>
                <Text style={styles.recPriority}>{rec.priority || 'MEDIUM'} PRIORITY</Text>
                <Text style={styles.recTitle}>{rec.title}</Text>
                {rec.description && <Text style={styles.recText}>{rec.description.substring(0, 300)}</Text>}
                {rec.actions && rec.actions.length > 0 && (
                  <Text style={styles.recActions}>• {rec.actions.slice(0, 3).join(' • ')}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            🔷 AI Compass — AI Readiness Assessment Platform
          </Text>
          <Text style={styles.footerText}>
            This report is confidential and intended for the assessed individual/organisation.
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default PDFReportDocument;
