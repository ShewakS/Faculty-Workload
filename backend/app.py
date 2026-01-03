from flask import Flask, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

# Replace this with your actual web app URL from deployment
APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzSA9uAJKbWCmMDgQ5YcEsmHzS3mtmVigrYfA2WQtBId4gW8roZNBSaFtv5_MqBVfWrrg/exec"

def fetch_from_apps_script(action):
    """Fetch data from Google Apps Script"""
    try:
        response = requests.get(f"{APPS_SCRIPT_URL}?action={action}")
        return response.json()
    except Exception as e:
        print(f"Error fetching from Apps Script: {e}")
        return {"error": str(e)}

@app.route('/api/workload', methods=['GET'])
def get_workload_data():
    """Main API endpoint for workload data"""
    try:
        data = fetch_from_apps_script('workload')
        
        # Check if Apps Script returned the specific no data error
        if isinstance(data, dict) and "No data found in spreadsheet" in data.get("error", ""):
            print("Apps Script returned no data. Serving mock data.")
            return jsonify(get_mock_data())
            
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def get_mock_data():
    """Return mock data when spreadsheet is empty"""
    return [
      {
        "faculty": "Dr. Alice Smith",
        "department": "Computer Science",
        "data_type": "Demo",
        "subject": "Data Structures",
        "year": "2nd Year",
        "section": "A",
        "teaching_hours": 6,
        "lab_hours": 2,
        "evaluation": "High",
        "workload_score": 12.00,
        "status": "Overloaded",
        "faculty_total_workload": 21.00,
        "dept_average": 15.00
      },
      {
        "faculty": "Dr. Alice Smith", 
        "department": "Computer Science",
        "data_type": "Demo",
        "subject": "Algorithms",
        "year": "3rd Year", 
        "section": "B",
        "teaching_hours": 4,
        "lab_hours": 0,
        "evaluation": "Medium",
        "workload_score": 6.00,
        "status": "Overloaded",
        "faculty_total_workload": 21.00,
        "dept_average": 15.00
      },
      {
        "faculty": "Prof. Bob Johnson",
        "department": "Computer Science", 
        "data_type": "Demo",
        "subject": "Operating Systems",
        "year": "3rd Year",
        "section": "A", 
        "teaching_hours": 6,
        "lab_hours": 3,
        "evaluation": "High",
        "workload_score": 13.50,
        "status": "Balanced",
        "faculty_total_workload": 13.50,
        "dept_average": 15.00
      },
       {
        "faculty": "Dr. Carol Davis",
        "department": "Mathematics",
        "data_type": "Demo", 
        "subject": "Calculus I",
        "year": "1st Year",
        "section": "A",
        "teaching_hours": 8,
        "lab_hours": 0,
        "evaluation": "High",
        "workload_score": 11.00,
        "status": "Underutilized", 
        "faculty_total_workload": 11.00,
        "dept_average": 11.00
      }
    ]

@app.route('/api/insights', methods=['GET'])
def get_insights():
    """AI insights endpoint"""
    try:
        data = fetch_from_apps_script('insights')
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)