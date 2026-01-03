# 🎓 Faculty Workload Management System

A comprehensive web application for managing and analyzing faculty workload distribution across departments. Built with React, Flask, and Google Sheets integration.

## 📋 Features

- **📊 Dashboard Overview** - Real-time statistics and workload distribution visualization
- **📈 Interactive Charts** - Bar charts for faculty workload comparison
- **🔥 Department Heatmap** - Visual representation of departmental workload levels
- **👥 Faculty Details** - Comprehensive table view of all faculty assignments
- **🤖 AI Insights** - Intelligent recommendations for workload balancing
- **📄 PDF Export** - Generate professional reports with one click
- **🔄 Live Data Sync** - Automatic updates from Google Forms submissions
- **🎨 Professional UI** - Light green theme with institutional design
- **📱 Responsive Design** - Works on desktop and tablet devices
- **🔍 Advanced Filtering** - Filter by department, data type, and faculty name

## 🏗️ Project Structure

```
Faculty/
├── backend/                    # Flask API Server
│   ├── app.py                 # Main Flask application with PDF export
│   ├── requirements.txt        # Python dependencies
│   └── workload_utils.py       # Utility functions for data processing
├── frontend/                   # React Application
│   ├── src/
│   │   ├── api/
│   │   │   └── api.js         # API client for backend communication
│   │   ├── components/        # React components
│   │   │   ├── Navigation.js
│   │   │   ├── Overview.js
│   │   │   ├── FacultyTable.js
│   │   │   ├── DepartmentHeatmap.js
│   │   │   ├── WorkloadChart.js
│   │   │   └── Insights.js
│   │   ├── App.js            # Main app component
│   │   ├── App_new.css       # Main styling (light green theme)
│   │   └── index.js          # React entry point
│   └── package.json          # Node dependencies
├── Complete_AppScript.gs      # Google Apps Script for data processing
├── AUTO_REFRESH_GUIDE.md      # Guide for form data auto-refresh
└── PDF_EXPORT_SETUP.md        # PDF export feature documentation
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 14+
- Google Account with Google Sheets and Forms

### Installation

**1. Clone or download the project**
```bash
cd Faculty
```

**2. Setup Backend**
```bash
cd backend
pip install -r requirements.txt
```

**3. Setup Frontend**
```bash
cd frontend
npm install
```

### Running the Application

**Terminal 1 - Backend (Port 5000)**
```bash
cd backend
python app.py
```

You should see:
```
* Running on http://127.0.0.1:5000
* Debug mode: on
```

**Terminal 2 - Frontend (Port 3000)**
```bash
cd frontend
npm start
```

Browser will open automatically at `http://localhost:3000`

## 🔌 Integration Setup

### Google Forms Connection

1. **Create a Google Form** with faculty workload questions
2. **Responses automatically go to** a Google Sheet named "Form Responses 1"
3. **Deploy Google Apps Script**:
   - Open the spreadsheet
   - Extensions > Apps Script
   - Copy `Complete_AppScript.gs` content
   - Deploy as Web App (Anyone access)
   - Copy the deployment URL

4. **Update Backend Configuration**:
   - Open `backend/app.py`
   - Replace line 8: `APPS_SCRIPT_URL` with your deployment URL

## 📊 Dashboard Views

### 1. Overview Dashboard
- Total faculty count
- Department statistics
- Average workload score
- Workload distribution (Overloaded/Balanced/Underutilized)

### 2. Faculty Workload
- Filterable table of all faculty assignments
- Search by faculty name or subject
- Filter by department
- Interactive bar chart visualization

### 3. Department Heatmap
- Color-coded department workload levels
- Faculty count per department
- Average workload per department
- Status breakdown (Overloaded/Balanced/Underutilized)

### 4. Faculty Detail
- Detailed table with all assignment information
- Teaching hours, lab hours
- Workload scores and status

### 5. AI Recommendations
- Intelligent insights about workload distribution
- Specific recommendations for improvement
- Risk analysis and concerns

### 6. Reports
- **Export as PDF** - Download professional reports
- **Refresh Data** - Force update from Google Forms
- Includes summary statistics and detailed tables

## 🔄 Data Flow

```
Google Forms
    ↓
Google Sheet (Form Responses 1)
    ↓
Google Apps Script (Complete_AppScript.gs)
    ↓
Flask Backend (http://localhost:5000/api/workload)
    ↓
React Frontend (http://localhost:3000)
    ↓
User Interface
```

## 📚 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/workload` | GET | Fetch all faculty workload data |
| `/api/insights` | GET | Get AI-powered insights |
| `/api/export-pdf` | POST | Generate and download PDF report |
| `/api/health` | GET | Health check endpoint |

## 🎨 Technology Stack

**Frontend:**
- React 19
- Chart.js 4.5 (data visualization)
- Axios (HTTP client)
- CSS3 (light green theme)

**Backend:**
- Flask 2.3
- Flask-CORS (cross-origin support)
- ReportLab (PDF generation)
- Python 3.8+

**Data Source:**
- Google Sheets
- Google Forms
- Google Apps Script

## 🎯 Workload Calculation

The system calculates workload using the formula:
```
Workload Score = (Teaching Hours × 1.0) + (Lab Hours × 1.5) + Evaluation Weight
```

Evaluation weights:
- Low: 1 point
- Medium: 2 points
- High: 3 points

**Status Classification:**
- **Overloaded**: Faculty workload > 120% of department average
- **Balanced**: Faculty workload between 80-120% of department average
- **Underutilized**: Faculty workload < 80% of department average

## 📖 Documentation

- **[AUTO_REFRESH_GUIDE.md](./AUTO_REFRESH_GUIDE.md)** - How to verify form data auto-refresh
- **[PDF_EXPORT_SETUP.md](./PDF_EXPORT_SETUP.md)** - PDF export feature setup

## 🎨 Customization

### Change Color Theme
Edit color variables in `frontend/src/components/Navigation.css` and `frontend/src/App_new.css`

### Modify Workload Calculation
Edit `backend/workload_utils.py` - `calculate_workload()` function

### Add Custom Fields
Update the Google Form and modify `Complete_AppScript.gs` to process new fields

## 🐛 Troubleshooting

### Data Not Loading
1. Verify Google Apps Script URL is correct in `app.py`
2. Check that Apps Script deployment is public (Anyone access)
3. Ensure "Form Responses 1" sheet exists and has data

### Backend Won't Start
```bash
pip install --upgrade flask flask-cors reportlab
```

### Frontend Won't Connect to Backend
1. Verify backend is running on port 5000
2. Check browser console for CORS errors (F12)
3. Verify API URL in `frontend/src/api/api.js`

## 📝 License

This project is designed for institutional use in managing faculty workload.

## 👥 Author

Created as an academic resource management tool for educational institutions.

---

**Need Help?** Check the documentation files or refer to the setup guides included in the project.
