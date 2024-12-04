import { TableData } from '../types/tableTypes';

export function analyzeTableData(data: TableData[]) {
  if (!data.length) return null;

  const analysis = {
    totalRecords: data.length,
    activeRecords: 0,
    recentChanges: 0,
    potentialIssues: [] as string[],
  };

  const now = new Date();
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  data.forEach(record => {
    // Count active records
    if ('status' in record && record.status === 'Active') {
      analysis.activeRecords++;
    }

    // Count recent changes
    if ('last_modified' in record) {
      const modifiedDate = new Date(record.last_modified);
      if (modifiedDate > lastWeek) {
        analysis.recentChanges++;
      }
    }
  });

  // Check for potential data quality issues
  const duplicateCheck = new Set();
  data.forEach(record => {
    if ('name' in record) {
      if (duplicateCheck.has(record.name)) {
        analysis.potentialIssues.push(`Potential duplicate name: ${record.name}`);
      }
      duplicateCheck.add(record.name);
    }
  });

  return analysis;
}