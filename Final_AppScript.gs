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
    let sheet = spreadsheet.getSheetByName(CONFIG.SOURCE_SHEET); // Assumes sheet name 'Form Responses 1' is correct? 
    // Wait, user might have different sheet name. Default is Form Responses 1.
    // I should probably warn about that? 
    // The user's URL had gid=2122912127. 
    // I can't know the name from GID easily without looking.
    // But 'Form Responses 1' is standard for Forms.
    // I will look for standard failure and just return [].
    
    if (!sheet) {
      // Fallback: try to get the first sheet if specific name fails
      sheet = spreadsheet.getSheets()[0];
    }
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return [];
    }
    
    const headers = data[0].map(h => h.toString().trim()); // Trim headers
    const rows = data.slice(1);
    
    return rows.map(row => {
      const record = {};
      headers.forEach((header, index) => {
        record[header] = row[index] || '';
      });
      return record;
    }).filter(row => {
        // Check for faculty name in user's format OR default format
        const name = row['Name of the Faculty'] || row['Faculty Name'];
        return name && name.toString().trim();
    });
    
  } catch (error) {
    throw new Error(`Failed to read spreadsheet: ${error.message}`);
  }
}

function normalizeWorkloadData(sourceData) {
  const normalized = [];
  
  sourceData.forEach(row => {
    // Map main fields with fallbacks
    const baseRecord = {
      faculty: row['Name of the Faculty'] || row['Faculty Name'],
      department: row['Department'] || 'Unknown',
      data_type: row['Data Type'] || 'Real'
    };
    
    for (let i = 1; i <= CONFIG.MAX_SUBJECTS; i++) {
        // Construct dynamic keys based on user format
        // Handle potential spacing variations in "Section  Si"
        let sectionKey = `Section S${i}`;
        if (row[`Section  S${i}`] !== undefined) sectionKey = `Section  S${i}`;
        
        // Map user's specific column names
        // Pattern: "Subject Name S1", "Year S1", "Teaching hours per week (above-mentioned class S1)"
        const subjectName = row[`Subject Name S${i}`] || row[`S${i}_Subject_Name`];
        const year = row[`Year S${i}`] || row[`S${i}_Year`];
        const section = row[sectionKey] || row[`S${i}_Section`];
        const teachingHours = row[`Teaching hours per week (above-mentioned class S${i})`] || row[`S${i}_Teaching_Hours`];
        const labHours = row[`Lab Hours per Week (above-mentioned class S${i})`] || row[`S${i}_Lab_Hours`];
        const evaluation = row[`Evaluation Workload S${i}`] || row[`S${i}_Evaluation_Load`];

      
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
    'Timestamp', 'Faculty Name', 'Department', 'Data Type',
    'S1_Subject_Name', 'S1_Year', 'S1_Section', 'S1_Teaching_Hours', 'S1_Lab_Hours', 'S1_Evaluation_Load',
    'S2_Subject_Name', 'S2_Year', 'S2_Section', 'S2_Teaching_Hours', 'S2_Lab_Hours', 'S2_Evaluation_Load',
    'S3_Subject_Name', 'S3_Year', 'S3_Section', 'S3_Teaching_Hours', 'S3_Lab_Hours', 'S3_Evaluation_Load'
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