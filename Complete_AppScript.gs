/**
 * Complete Faculty Workload Management System for Google Apps Script
 * Copy this entire file into your Apps Script project
 */

// Configuration
const CONFIG = {
  SOURCE_SHEET: 'Form Responses 1',
  MAX_SUBJECTS: 9,
  EVALUATION_WEIGHTS: {
    'Low': 1,
    'Medium': 2,
    'High': 3
  }
};

/**
 * Web App endpoint - handles HTTP requests
 */
function doGet(e) {
  if (!e || !e.parameter) {
    return ContentService.createTextOutput(JSON.stringify({error: "No parameters provided"}))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  const action = e.parameter.action || 'workload';
  
  switch(action) {
    case 'workload':
      return getWorkloadData();
    case 'insights':
      return getInsightsData();
    case 'health':
      return ContentService.createTextOutput(JSON.stringify({status: "healthy"}))
        .setMimeType(ContentService.MimeType.JSON);
    default:
      return ContentService.createTextOutput(JSON.stringify({error: "Invalid action"}))
        .setMimeType(ContentService.MimeType.JSON);
  }
}

function getWorkloadData() {
  try {
    // Direct call without checking if function exists
    const sourceData = readSourceData();
    const normalizedData = normalizeWorkloadData(sourceData);
    const processedData = calculateWorkloadScores(normalizedData);
    const balancedData = detectWorkloadImbalances(processedData);
    
    return ContentService.createTextOutput(JSON.stringify(balancedData))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getInsightsData() {
  try {
    // Direct processing without function call
    const sourceData = readSourceData();
    const normalizedData = normalizeWorkloadData(sourceData);
    const processedData = calculateWorkloadScores(normalizedData);
    const balancedData = detectWorkloadImbalances(processedData);
    const insights = generateBasicInsights(balancedData);
    
    return ContentService.createTextOutput(JSON.stringify(insights))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Main workload processing function
 */
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
  // Use the specific spreadsheet ID instead of getActiveSpreadsheet
  const SPREADSHEET_ID = '1_NOTVdQ9bj-5BkqWjuJl2fuskb7nT-8Hyjl9UYrtbfM';
  
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(CONFIG.SOURCE_SHEET);
    
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
  } catch (error) {
    console.error('Error reading source data:', error);
    throw new Error(`Failed to read data: ${error.message}`);
  }
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

function generateBasicInsights(data) {
  if (!data || !Array.isArray(data)) {
    return {
      summary: "No data available for insights",
      recommendations: []
    };
  }
  
  const overloaded = data.filter(f => f.status && f.status.includes('Overloaded'));
  const underutilized = data.filter(f => f.status && f.status.includes('Underutilized'));
  
  return {
    summary: `Found ${overloaded.length} overloaded and ${underutilized.length} underutilized faculty`,
    recommendations: overloaded.slice(0, 3).map(f => 
      `Redistribute workload from ${f.faculty} (Score: ${f.workload_score})`
    )
  };
}

/**
 * Create demo data for testing
 */
function createDemoData() {
  const SPREADSHEET_ID = '1_NOTVdQ9bj-5BkqWjuJl2fuskb7nT-8Hyjl9UYrtbfM';
  
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName('Form Responses 1');
    
    if (!sheet) {
      sheet = spreadsheet.insertSheet('Form Responses 1');
    }
    
    sheet.clear();
    
    const headers = [
      'Timestamp', 'Faculty Name', 'Department', 'Data Type',
      'S1_Subject_Name', 'S1_Year', 'S1_Section', 'S1_Teaching_Hours', 'S1_Lab_Hours', 'S1_Evaluation_Load',
      'S2_Subject_Name', 'S2_Year', 'S2_Section', 'S2_Teaching_Hours', 'S2_Lab_Hours', 'S2_Evaluation_Load',
      'S3_Subject_Name', 'S3_Year', 'S3_Section', 'S3_Teaching_Hours', 'S3_Lab_Hours', 'S3_Evaluation_Load'
    ];
    
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    const demoData = [
      [
        new Date(), 'Dr. Alice Smith', 'Computer Science', 'Demo',
        'Data Structures', '2nd Year', 'A', 6, 2, 'High',
        'Algorithms', '3rd Year', 'B', 4, 0, 'Medium',
        'Database Systems', '3rd Year', 'A', 4, 2, 'High'
      ],
      [
        new Date(), 'Prof. Bob Johnson', 'Computer Science', 'Demo',
        'Operating Systems', '3rd Year', 'A', 6, 3, 'High',
        'Computer Networks', '4th Year', 'B', 4, 2, 'Medium',
        '', '', '', '', '', ''
      ],
      [
        new Date(), 'Dr. Carol Davis', 'Mathematics', 'Demo',
        'Calculus I', '1st Year', 'A', 8, 0, 'High',
        'Linear Algebra', '2nd Year', 'B', 6, 0, 'Medium',
        'Statistics', '3rd Year', 'A', 4, 1, 'Low'
      ],
      [
        new Date(), 'Prof. David Wilson', 'Mathematics', 'Demo',
        'Discrete Mathematics', '2nd Year', 'A', 4, 0, 'Medium',
        '', '', '', '', '', '',
        '', '', '', '', '', ''
      ],
      [
        new Date(), 'Dr. Eva Brown', 'Physics', 'Demo',
        'Physics I', '1st Year', 'A', 6, 3, 'High',
        'Physics II', '1st Year', 'B', 6, 3, 'High',
        'Quantum Mechanics', '4th Year', 'A', 4, 0, 'Medium'
      ]
    ];
    
    sheet.getRange(2, 1, demoData.length, headers.length).setValues(demoData);
    
    console.log('Demo data created successfully');
  } catch (error) {
    console.error('Error creating demo data:', error);
    throw error;
  }
}

/**
 * Test function
 */
function myFunction() {
  console.log('Test function works');
}