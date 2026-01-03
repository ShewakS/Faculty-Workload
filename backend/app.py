from flask import Flask, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

# Replace this with your actual web app URL from deployment
APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzOokk5_uj_EDTWNShc4Kjs4ccuBqGQOO9s11EP8X-681aX97Yd7ezTKG_YumhrKo3JPQ/exec"

def fetch_from_apps_script(action):
    """Fetch data from Google Apps Script"""
    try:
        response = requests.get(f"{APPS_SCRIPT_URL}?action={action}", timeout=30)
        print(f"Response status: {response.status_code}")
        print(f"Response content: {response.text[:200]}...")
        
        if response.status_code != 200:
            return {"error": f"HTTP {response.status_code}: {response.text}"}
            
        if not response.text.strip():
            return {"error": "Empty response from Apps Script"}
            
        return response.json()
    except requests.exceptions.Timeout:
        return {"error": "Apps Script timeout"}
    except ValueError as e:
        return {"error": f"Invalid JSON response: {response.text[:100]}"}
    except Exception as e:
        return {"error": f"Network error: {str(e)}"}

@app.route('/api/workload', methods=['GET'])
def get_workload_data():
    """Main API endpoint for workload data"""
    try:
        data = fetch_from_apps_script('workload')
        
        if isinstance(data, dict) and "error" in data:
            print(f"Apps Script error: {data['error']}")
            return jsonify(get_mock_data())
            
        return jsonify(data)
    except Exception as e:
        print(f"API error: {str(e)}")
        return jsonify(get_mock_data())

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
        if isinstance(data, dict) and "error" in data:
            return jsonify({"summary": "No insights available", "recommendations": []})
        return jsonify(data)
    except Exception as e:
        return jsonify({"summary": "No insights available", "recommendations": []})

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)