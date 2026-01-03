/**
 * Minimal Faculty Workload System - Returns Sample Data
 */

function doGet(e) {
  const action = e && e.parameter ? e.parameter.action : 'workload';
  
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
  // Return sample data directly - no sheet access needed
  const sampleData = [
    {
      faculty: "Dr. Alice Smith",
      department: "Computer Science",
      subject: "Data Structures",
      year: "2nd Year",
      section: "A",
      teaching_hours: 6,
      lab_hours: 2,
      evaluation: "High",
      workload_score: 11.0,
      status: "Overloaded",
      faculty_total_workload: 25.5,
      dept_average: 18.2,
      data_type: "Demo"
    },
    {
      faculty: "Dr. Alice Smith",
      department: "Computer Science", 
      subject: "Algorithms",
      year: "3rd Year",
      section: "B",
      teaching_hours: 4,
      lab_hours: 0,
      evaluation: "Medium",
      workload_score: 6.0,
      status: "Overloaded",
      faculty_total_workload: 25.5,
      dept_average: 18.2,
      data_type: "Demo"
    },
    {
      faculty: "Prof. Bob Johnson",
      department: "Computer Science",
      subject: "Operating Systems", 
      year: "3rd Year",
      section: "A",
      teaching_hours: 6,
      lab_hours: 3,
      evaluation: "High",
      workload_score: 13.5,
      status: "Balanced",
      faculty_total_workload: 19.5,
      dept_average: 18.2,
      data_type: "Demo"
    },
    {
      faculty: "Dr. Carol Davis",
      department: "Mathematics",
      subject: "Calculus I",
      year: "1st Year", 
      section: "A",
      teaching_hours: 8,
      lab_hours: 0,
      evaluation: "High",
      workload_score: 11.0,
      status: "Underutilized",
      faculty_total_workload: 12.0,
      dept_average: 16.5,
      data_type: "Demo"
    },
    {
      faculty: "Prof. David Wilson",
      department: "Mathematics",
      subject: "Discrete Mathematics",
      year: "2nd Year",
      section: "A", 
      teaching_hours: 4,
      lab_hours: 0,
      evaluation: "Medium",
      workload_score: 6.0,
      status: "Underutilized",
      faculty_total_workload: 6.0,
      dept_average: 16.5,
      data_type: "Demo"
    }
  ];
  
  return ContentService.createTextOutput(JSON.stringify(sampleData))
    .setMimeType(ContentService.MimeType.JSON);
}

function getInsightsData() {
  const insights = {
    summary: "Found 1 overloaded and 2 underutilized faculty members",
    recommendations: [
      "Redistribute workload from Dr. Alice Smith (Score: 25.5)",
      "Consider assigning more subjects to Dr. Carol Davis (Score: 12.0)",
      "Consider assigning more subjects to Prof. David Wilson (Score: 6.0)"
    ]
  };
  
  return ContentService.createTextOutput(JSON.stringify(insights))
    .setMimeType(ContentService.MimeType.JSON);
}

function myFunction() {
  console.log('Test function works');
}