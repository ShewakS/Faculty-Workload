# Faculty Workload Management - React + Flask Application

A modern web application for managing faculty workloads with React frontend and Flask backend, integrated with Google Sheets.

## 🏗️ Architecture

```
Frontend (React) ←→ Backend (Flask) ←→ Google Sheets API
     ↓                    ↓
  Visualizations      Data Processing
```

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

### 2. Google Sheets API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable Google Sheets API
4. Create Service Account:
   - Go to IAM & Admin > Service Accounts
   - Create Service Account
   - Download JSON key file
   - Rename to `service_account.json` in `backend/` folder
5. Share your Google Sheet with service account email

### 3. Frontend Setup

```bash
cd frontend
npm install
```

### 4. Run Application

**Terminal 1 - Backend:**
```bash
cd backend
python app.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

Open http://localhost:3000

## 📊 Features

### Backend (Flask)
- **Google Sheets Integration**: Real-time data fetching
- **Data Normalization**: Multi-subject entries → individual records
- **Workload Calculation**: `(teaching_hours × 1.0) + (lab_hours × 1.5) + evaluation_weight`
- **Imbalance Detection**: Department-based thresholds
- **REST API**: JSON endpoints for frontend

### Frontend (React)
- **Interactive Dashboard**: Real-time data visualization
- **Faculty Table**: Sortable, color-coded workload data
- **Workload Charts**: Bar charts with status indicators
- **Filters**: Department and data type filtering
- **AI Insights**: Workload redistribution recommendations

## 🔧 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/workload` | GET | Processed faculty workload data |
| `/api/insights` | GET | AI-generated recommendations |
| `/api/health` | GET | Backend health check |

## 📋 Data Flow

1. **Google Sheets** → Raw faculty submissions
2. **Flask Backend** → Normalize, calculate, detect imbalances
3. **React Frontend** → Fetch via API, visualize data
4. **User Interface** → Interactive dashboard with filters

## 🎨 Components

### React Components
- **App.js**: Main application with state management
- **FacultyTable.js**: Data table with color-coded status
- **WorkloadChart.js**: Bar chart visualization
- **Insights.js**: AI recommendations display

### Backend Modules
- **app.py**: Flask server with API endpoints
- **workload_utils.py**: Data processing functions

## 📊 Sample Data Structure

**Input (Google Sheets):**
```json
{
  "Faculty Name": "Dr. Alice Smith",
  "Department": "Computer Science",
  "Data Type": "Demo",
  "S1_Subject_Name": "Data Structures",
  "S1_Teaching_Hours": 6,
  "S1_Lab_Hours": 2,
  "S1_Evaluation_Load": "High"
}
```

**Output (API Response):**
```json
{
  "faculty": "Dr. Alice Smith",
  "department": "Computer Science",
  "subject": "Data Structures",
  "teaching_hours": 6,
  "lab_hours": 2,
  "evaluation": "High",
  "workload_score": 11.0,
  "status": "Overloaded",
  "data_type": "Demo"
}
```

## 🎯 Status Classification

- 🔴 **Overloaded**: >120% of department average
- 🟡 **Balanced**: 80-120% of department average
- 🟢 **Underutilized**: <80% of department average

## 🔧 Configuration

### Backend Configuration (app.py)
```python
SHEET_NAME = "Faculty Workload Management"
WORKSHEET_NAME = "Form Responses 1"
```

### Workload Thresholds (workload_utils.py)
```python
# Adjust these ratios as needed
if ratio > 1.2:  # Overloaded threshold
    status = 'Overloaded'
elif ratio < 0.8:  # Underutilized threshold
    status = 'Underutilized'
```

## 🚨 Troubleshooting

### Backend Issues
- **"Sheet not found"**: Check sheet name in `app.py`
- **"Permission denied"**: Share sheet with service account email
- **"Module not found"**: Run `pip install -r requirements.txt`

### Frontend Issues
- **"Network Error"**: Ensure Flask backend is running on port 5000
- **"CORS Error"**: Flask-CORS is installed and configured
- **Charts not loading**: Check Chart.js installation

### Google Sheets API
- **Authentication Error**: Verify service account JSON file
- **API Quota Exceeded**: Check Google Cloud Console quotas
- **Data Not Updating**: Refresh browser or check sheet permissions

## 📈 Extending the Application

### Add New Visualizations
```javascript
// In WorkloadChart.js
import { Pie, Line } from 'react-chartjs-2';
```

### Add New API Endpoints
```python
# In app.py
@app.route('/api/departments', methods=['GET'])
def get_departments():
    # Return department statistics
```

### Integrate Gemini AI
```python
# Add to backend/app.py
import google.generativeai as genai

@app.route('/api/ai-insights', methods=['GET'])
def get_ai_insights():
    # Use Gemini API for advanced insights
```

## 🎯 Production Deployment

### Backend (Flask)
- Use Gunicorn: `gunicorn app:app`
- Deploy to Heroku, AWS, or Google Cloud
- Set environment variables for API keys

### Frontend (React)
- Build: `npm run build`
- Deploy to Netlify, Vercel, or GitHub Pages
- Update API base URL for production

## 📊 Expected Results

After setup, you'll have:
- ✅ Interactive web dashboard
- ✅ Real-time Google Sheets integration
- ✅ Color-coded workload visualization
- ✅ Department-wise analysis
- ✅ AI-powered recommendations
- ✅ Responsive design for all devices

The application provides a modern, interactive interface for faculty workload management with seamless Google Sheets integration and real-time updates.