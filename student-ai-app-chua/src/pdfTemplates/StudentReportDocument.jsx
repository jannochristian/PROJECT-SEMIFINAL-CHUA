import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30 },
  title: 
  { fontSize: 24, 
    marginBottom: 20, 
    textAlign: 'center' 
  },

  section: 
  { margin: 10, 
    paddingBottom: 10, 
    borderBottom: 1 
  },

  header: 
  { fontSize: 12, 
    marginBottom: 10, 
    color: '#2563eb' 
  },

  text: 
  { fontSize: 12, 
    marginBottom: 5 
  },

  table: 
  { display: 'table', 
    width: '100%', 
    fontSize: 12 
  },

  tableRow: 
  { flexDirection: 'row', 
    borderBottom: 1 
  },

  tableCell: 
  { padding: 4, 
    flex: 1 
  }
});

// Compute average para mo lista sa pdf
const computeAverage = (s) => {
  const g = [s.prelim, s.midterm, s.semifinal, s.final].map(n => parseFloat(n));
  if (g.some(isNaN)) return "-";
  return (g.reduce((a, b) => a + b, 0) / 4).toFixed(2);
};

export const GradeReport = ({ subject, students, report }) => (
  <Document>
    <Page size="A4" style={styles.page}>

      <Text style={styles.title}>
        Grade Report
      </Text>

      <Text style={{ fontSize: 13, marginBottom: 12, textAlign: "center" }}>
        Subject: {subject?.subject_name || "Unknown Subject"}
      </Text>

      <View style={styles.section}>
        <Text style={styles.header}>Analysis Summary</Text>
        <Text style={styles.text}>{report?.summary || "No analysis available."}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.header}>Student Grades</Text>

        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableCell}>Student</Text>
            <Text style={styles.tableCell}>Prelim</Text>
            <Text style={styles.tableCell}>Midterm</Text>
            <Text style={styles.tableCell}>Semifinal</Text>
            <Text style={styles.tableCell}>Final</Text>
            <Text style={styles.tableCell}>Average</Text>
          </View>

          {students.map((s, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={styles.tableCell}>{`${s.first_name} ${s.last_name}`}</Text>
              <Text style={styles.tableCell}>{s.prelim || "-"}</Text>
              <Text style={styles.tableCell}>{s.midterm || "-"}</Text>
              <Text style={styles.tableCell}>{s.semifinal || "-"}</Text>
              <Text style={styles.tableCell}>{s.final || "-"}</Text>
              <Text style={styles.tableCell}>{computeAverage(s)}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.header}>Performance Summary</Text>
        <Text style={styles.text}>Passed Students:</Text>
        <Text style={styles.text}>{report?.passed?.join(", ") || "None"}</Text>

        <Text style={styles.text}>Failed Students:</Text>
        <Text style={styles.text}>{report?.failed?.join(", ") || "None"}</Text>
      </View>

    </Page>
  </Document>
);
