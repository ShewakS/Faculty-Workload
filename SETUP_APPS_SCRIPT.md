# Faculty Workload - Google Apps Script Setup

## 🚀 Quick Setup (No API Keys Needed!)

### Step 1: Deploy Google Apps Script as Web App

1. **Open your Google Sheet with faculty data**
2. **Go to Extensions > Apps Script**
3. **Add the WebApp.gs file** to your Apps Script project
4. **Deploy as Web App**:
   - Click "Deploy" > "New Deployment"
   - Type: "Web app"
   - Execute as: "Me"
   - Who has access: "Anyone"
   - Click "Deploy"
   - Copy the Web App URL

### Step 2: Update Backend Configuration

1. **Edit `backend/app.py`** line 8:
   ```python
   APPS_SCRIPT_URL = "YOUR_COPIED_WEB_APP_URL_HERE"
   ```

### Step 3: Install Dependencies

```bash
cd backend
pip install -r requirements_simple.txt
```

```bash
cd frontend
npm install
```

### Step 4: Run Application

**Terminal 1 (Backend)**:
```bash
cd backend
python app.py
```

**Terminal 2 (Frontend)**:
```bash
cd frontend
npm start
```

### Step 5: Open Browser
- Go to: http://localhost:3000
- Your React app will fetch data from Google Apps Script!

## ✅ What You Need Before Running

1. ✅ Google Apps Script deployed as web app
2. ✅ Web app URL added to `backend/app.py`
3. ✅ Python dependencies installed
4. ✅ React dependencies installed

## 🔧 Troubleshooting

- **"CORS Error"**: Make sure Apps Script is deployed with "Anyone" access
- **"No data"**: Check if `processWorkloadData()` function exists in your Apps Script
- **"Network Error"**: Verify the web app URL is correct

This approach is much simpler - no API keys or service accounts needed!