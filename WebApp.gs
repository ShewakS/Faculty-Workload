/**
 * Web App endpoint for React frontend
 * Deploy as web app with execute permissions for "Anyone"
 */

/**
 * Test function to avoid myFunction error
 */
function myFunction() {
  console.log('Test function');
}

function doGet(e) {
  // Handle case when e is undefined (direct execution)
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
    // Check if processWorkloadData function exists
    if (typeof processWorkloadData !== 'function') {
      throw new Error('processWorkloadData function not found. Make sure Code.gs is included.');
    }
    
    const processedData = processWorkloadData();
    return ContentService.createTextOutput(JSON.stringify(processedData))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getInsightsData() {
  try {
    // Check if functions exist
    if (typeof processWorkloadData !== 'function') {
      throw new Error('processWorkloadData function not found. Make sure Code.gs is included.');
    }
    
    const processedData = processWorkloadData();
    const insights = generateBasicInsights(processedData);
    return ContentService.createTextOutput(JSON.stringify(insights))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
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
      `Redistribute workload from ${f.faculty} (Score: ${f.workloadScore || f.workload_score})`
    )
  };
}

/**
 * Test function to verify web app works
 */
function testWebApp() {
  const mockEvent = {
    parameter: {
      action: 'health'
    }
  };
  
  const result = doGet(mockEvent);
  console.log('Test result:', result.getContent());
}