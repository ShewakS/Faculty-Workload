/**
 * Faculty Workload System - Reads from Your Actual Spreadsheet
 */

const CONFIG = {
  SOURCE_SHEET: 'Form Responses 1',
  SPREADSHEET_ID: '1_NOTVdQ9bj-5BkqWjuJl2fuskb7nT-8Hyjl9UYrtbfM', // User provided ID
  MAX_SUBJECTS: 9,
  EVALUATION_WEIGHTS: {
    'Low': 1,
    'Medium': 2,
    'High': 3
  }
};

function doGet(e) {
  // Default to workload if no action specified
  const action = e && e.parameter && e.parameter.action ? e.parameter.action : 'workload';
  
  switch(action) {
    case 'workload':
      return getWorkloadData();
    case 'insights':
      return getInsightsData();
    case 'health':
      return ContentService.createTextOutput(JSON.stringify({status: "healthy"}))
        .setMimeType(ContentService.MimeType.JSON);
    default:
      // Return workload data by default
      return getWorkloadData();
  }
}

function getWorkloadData() {
  try {
    const sourceData = readSourceData();
    if (!sourceData || sourceData.length === 0) {
      return ContentService.createTextOutput(JSON.stringify({error: "No data found in spreadsheet"}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
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

function readSourceData() {
  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName(CONFIG.SOURCE_SHEET);
    
    if (!sheet) {
      sheet = spreadsheet.getSheets()[0];
    }
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return [];
    }
    
    const headers = data[0].map(h => h.toString().trim());
    const rows = data.slice(1);
    
    return rows.map(row => {
      const record = {};
      headers.forEach((header, index) => {
        record[header] = row[index] || '';
      });
      return record;
    }).filter(row => {
      // Filter out empty rows by checking for any faculty name field
      const possibleNameFields = Object.keys(row).filter(key => 
        key.toLowerCase().includes('faculty') && key.toLowerCase().includes('name')
      );
      return possibleNameFields.some(field => row[field] && row[field].toString().trim());
    });
    
  } catch (error) {
    throw new Error(`Failed to read spreadsheet: ${error.message}`);
  }
}

function createHeaderMapping(headers) {
  const mapping = {};
  
  // Create flexible mapping for common variations
  headers.forEach(header => {
    const cleanHeader = header.toLowerCase().trim();
    
    // Faculty name variations
    if (cleanHeader.includes('faculty') && cleanHeader.includes('name')) {
      mapping.facultyName = header;
    }
    // Department variations - exact match first, then flexible
    if (cleanHeader === 'department') {
      mapping.department = header;
    } else if (!mapping.department && (cleanHeader.includes('department') || cleanHeader.includes('dept')) && !cleanHeader.includes('s1') && !cleanHeader.includes('s2') && !cleanHeader.includes('s3') && !cleanHeader.includes('s4')) {
      mapping.department = header;
    }
    
    // Subject-specific mappings (S1, S2, etc.)
    for (let i = 1; i <= CONFIG.MAX_SUBJECTS; i++) {
      const subjectPattern = new RegExp(`s${i}|subject.*${i}`, 'i');
      const yearPattern = new RegExp(`year.*s${i}|s${i}.*year`, 'i');
      const sectionPattern = new RegExp(`section.*s${i}|s${i}.*section`, 'i');
      const teachingPattern = new RegExp(`teaching.*hours.*s${i}|s${i}.*teaching`, 'i');
      const labPattern = new RegExp(`lab.*hours.*s${i}|s${i}.*lab`, 'i');
      const evalPattern = new RegExp(`evaluation.*s${i}|s${i}.*evaluation`, 'i');
      
      if (subjectPattern.test(cleanHeader) && cleanHeader.includes('name')) {
        mapping[`subject${i}`] = header;
      }
      if (yearPattern.test(cleanHeader)) {
        mapping[`year${i}`] = header;
      }
      if (sectionPattern.test(cleanHeader)) {
        mapping[`section${i}`] = header;
      }
      if (teachingPattern.test(cleanHeader)) {
        mapping[`teaching${i}`] = header;
      }
      if (labPattern.test(cleanHeader)) {
        mapping[`lab${i}`] = header;
      }
      if (evalPattern.test(cleanHeader)) {
        mapping[`evaluation${i}`] = header;
      }
    }
  });
  
  return mapping;
}

function normalizeWorkloadData(sourceData) {
  if (!sourceData || sourceData.length === 0) return [];
  
  const headers = Object.keys(sourceData[0]);
  const headerMapping = createHeaderMapping(headers);
  const normalized = [];
  
  sourceData.forEach(row => {
    const baseRecord = {
      faculty: row[headerMapping.facultyName] || 'Unknown Faculty',
      department: row[headerMapping.department] || 'Unknown Department',
      data_type: 'Real'
    };
    
    for (let i = 1; i <= CONFIG.MAX_SUBJECTS; i++) {
      const subjectName = row[headerMapping[`subject${i}`]];
      const year = row[headerMapping[`year${i}`]];
      const section = row[headerMapping[`section${i}`]];
      const teachingHours = row[headerMapping[`teaching${i}`]];
      const labHours = row[headerMapping[`lab${i}`]];
      const evaluation = row[headerMapping[`evaluation${i}`]];
      
      if (subjectName && subjectName.toString().trim()) {
        normalized.push({
          ...baseRecord,
          subject: subjectName.toString().trim(),
          year: year || '',
          section: section || '',
          teaching_hours: parseFloat(teachingHours) || 0,
          lab_hours: parseFloat(labHours) || 0,
          evaluation: evaluation || 'Medium'
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
  if (!processedData || processedData.length === 0) {
    return [];
  }
  
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

function getInsightsData() {
  try {
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

function generateBasicInsights(data) {
  if (!data || !Array.isArray(data) || data.length === 0) {
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

function createSampleHeaders(sheet) {
  const headers = [
    'Timestamp', 'Name of the Faculty', 'Department',
    'Subject Name S1', 'Year S1', 'Section S1', 'Teaching hours per week (above-mentioned class S1)', 'Lab Hours per Week (above-mentioned class S1)', 'Evaluation Workload S1',
    'Subject Name S2', 'Year S2', 'Section S2', 'Teaching hours per week (above-mentioned class S2)', 'Lab Hours per Week (above-mentioned class S2)', 'Evaluation Workload S2',
    'Subject Name S3', 'Year S3', 'Section S3', 'Teaching hours per week (above-mentioned class S3)', 'Lab Hours per Week (above-mentioned class S3)', 'Evaluation Workload S3'
  ];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
}

function addSampleData() {
  try {
    const spreadsheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName(CONFIG.SOURCE_SHEET);
    
    if (!sheet) {
      sheet = spreadsheet.insertSheet(CONFIG.SOURCE_SHEET);
    }
    
    sheet.clear();
    createSampleHeaders(sheet);
    
    const sampleData = [
      [
        new Date(), 'Dr. Alice Smith', 'Computer Science',
        'Data Structures', '2nd Year', 'A', 6, 2, 'High',
        'Algorithms', '3rd Year', 'B', 4, 0, 'Medium',
        'Database Systems', '3rd Year', 'A', 4, 2, 'High'
      ],
      [
        new Date(), 'Prof. Bob Johnson', 'Computer Science',
        'Operating Systems', '3rd Year', 'A', 6, 3, 'High',
        'Computer Networks', '4th Year', 'B', 4, 2, 'Medium',
        '', '', '', '', '', ''
      ],
      [
        new Date(), 'Dr. Carol Davis', 'Mathematics',
        'Calculus I', '1st Year', 'A', 8, 0, 'High',
        'Linear Algebra', '2nd Year', 'B', 6, 0, 'Medium',
        'Statistics', '3rd Year', 'A', 4, 1, 'Low'
      ]
    ];
    
    sheet.getRange(2, 1, sampleData.length, sampleData[0].length).setValues(sampleData);
    console.log('Sample data added successfully');
    
  } catch (error) {
    console.error('Error adding sample data:', error);
    throw error;
  }
}

function myFunction() {
  console.log('Test function works');
}
function myFunction() {
  console.log('Test function works');
}