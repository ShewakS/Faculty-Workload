/**
 * Utility functions for testing and demo data
 */

function createDemoData() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Form Responses 1');
  if (!sheet) {
    throw new Error('Form Responses 1 sheet not found');
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
}