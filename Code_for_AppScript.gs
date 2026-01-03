/**
 * Main workload processing functions for Google Apps Script
 */

const CONFIG = {
  SOURCE_SHEET: 'Form Responses 1',
  MAX_SUBJECTS: 9,
  EVALUATION_WEIGHTS: {
    'Low': 1,
    'Medium': 2,
    'High': 3
  }
};

function processWorkloadData() {
  try {
    const sourceData = readSourceData();
    const normalizedData = normalizeWorkloadData(sourceData);
    const processedData = calculateWorkloadScores(normalizedData);
    const balancedData = detectWorkloadImbalances(processedData);
    
    return balancedData;
  } catch (error) {
    console.error('Error processing workload data:', error);
    throw error;
  }
}

function readSourceData() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.SOURCE_SHEET);
  if (!sheet) {
    throw new Error(`Sheet "${CONFIG.SOURCE_SHEET}" not found`);
  }
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);
  
  return rows.map(row => {
    const record = {};
    headers.forEach((header, index) => {
      record[header] = row[index];
    });
    return record;
  }).filter(row => row['Faculty Name']);
}

function normalizeWorkloadData(sourceData) {
  const normalized = [];
  
  sourceData.forEach(row => {
    const baseRecord = {
      faculty: row['Faculty Name'],
      department: row['Department'],
      data_type: row['Data Type'] || 'Real'
    };
    
    for (let i = 1; i <= CONFIG.MAX_SUBJECTS; i++) {
      const subjectName = row[`S${i}_Subject_Name`];
      
      if (subjectName && subjectName.toString().trim()) {
        normalized.push({
          ...baseRecord,
          subject: subjectName.toString().trim(),
          year: row[`S${i}_Year`] || '',
          section: row[`S${i}_Section`] || '',
          teaching_hours: parseFloat(row[`S${i}_Teaching_Hours`]) || 0,
          lab_hours: parseFloat(row[`S${i}_Lab_Hours`]) || 0,
          evaluation: row[`S${i}_Evaluation_Load`] || 'Medium'
        });
      }
    }
  });
  
  return normalized;
}

function calculateWorkloadScores(normalizedData) {
  return normalizedData.map(record => {
    const evaluationWeight = CONFIG.EVALUATION_WEIGHTS[record.evaluation] || 2;
    const workloadScore = (record.teaching_hours * 1.0) + (record.lab_hours * 1.5) + evaluationWeight;
    
    return {
      ...record,
      workload_score: Math.round(workloadScore * 100) / 100
    };
  });
}

function detectWorkloadImbalances(processedData) {
  const facultyWorkloads = {};
  
  processedData.forEach(record => {
    const key = `${record.faculty}_${record.department}`;
    if (!facultyWorkloads[key]) {
      facultyWorkloads[key] = {
        faculty: record.faculty,
        department: record.department,
        data_type: record.data_type,
        totalWorkload: 0
      };
    }
    facultyWorkloads[key].totalWorkload += record.workload_score;
  });
  
  const deptAverages = {};
  Object.values(facultyWorkloads).forEach(faculty => {
    if (!deptAverages[faculty.department]) {
      deptAverages[faculty.department] = { total: 0, count: 0 };
    }
    deptAverages[faculty.department].total += faculty.totalWorkload;
    deptAverages[faculty.department].count++;
  });
  
  Object.keys(deptAverages).forEach(dept => {
    deptAverages[dept].average = deptAverages[dept].total / deptAverages[dept].count;
  });
  
  return processedData.map(record => {
    const facultyKey = `${record.faculty}_${record.department}`;
    const facultyTotal = facultyWorkloads[facultyKey].totalWorkload;
    const deptAvg = deptAverages[record.department].average;
    const ratio = facultyTotal / deptAvg;
    
    let status;
    if (ratio > 1.2) {
      status = 'Overloaded';
    } else if (ratio < 0.8) {
      status = 'Underutilized';
    } else {
      status = 'Balanced';
    }
    
    return {
      ...record,
      status,
      faculty_total_workload: Math.round(facultyTotal * 100) / 100,
      dept_average: Math.round(deptAvg * 100) / 100
    };
  });
}