# Auto-Refresh Data from Google Form - Setup & Troubleshooting Guide

## ✅ **Yes, New Form Responses SHOULD Display on Reload**

Your application is configured to automatically fetch fresh data from Google Sheets every time the page loads or when you click "Refresh Data".

---

## 📋 **Data Flow Verification**

Your current setup:

```
Google Form (Your Form)
     ↓
Google Sheet: "Form Responses 1" (Stores form submissions)
     ↓
Google Apps Script Web App (Reads Sheet, processes data)
     ↓
Flask Backend: /api/workload (Calls Apps Script)
     ↓
React Frontend (Displays data)
```

---

## 🔍 **Key Configuration Points**

### **1. Apps Script Configuration**
- **Spreadsheet ID**: `1_NOTVdQ9bj-5BkqWjuJl2fuskb7nT-8Hyjl9UYrtbfM`
- **Sheet Name**: `Form Responses 1` (from CONFIG.SOURCE_SHEET)
- **Reads from**: Column A onwards (Form responses)

### **2. Flask Backend**
- **Apps Script URL**: Defined in `app.py` line 8
- **Endpoint**: `/api/workload`
- **Behavior**: Fetches fresh data on each request (no caching)

### **3. React Frontend**
- **Loads data on**: Page load (useEffect in App.js)
- **Refresh button**: Manually reload data anytime
- **Auto-display**: Shows all data returned from API

---

## ✨ **How to Test It Works**

### **Step 1: Fill a Test Form Entry**

1. Open your Google Form
2. Fill in a new faculty member's workload data
3. Submit the form
4. Go to Google Sheet and verify data appears in "Form Responses 1"

### **Step 2: Check Google Sheet**

1. Open the Google Sheet directly
2. Look at the sheet named "Form Responses 1"
3. Verify the new row was added with form data

### **Step 3: Reload Your Application**

1. Open browser developer tools (F12)
2. Go to Network tab
3. Reload the page (Ctrl+R or Cmd+R)
4. Look for request to `/api/workload`
5. Check response to see if new data is included

### **Step 4: Verify in App**

1. Check if new faculty name appears in the tables
2. Check Overview dashboard - numbers should update
3. Check Faculty Table - new entry should be visible
4. Check Heatmap - department statistics should update

---

## 🚨 **Troubleshooting: If New Data Doesn't Appear**

### **Problem 1: Data Not Appearing After Form Submission**

**Check These:**

1. **Google Form is connected to correct Sheet**
   - Open your Google Form
   - Click Settings (gear icon)
   - In "Responses" tab, verify it shows: "Responses go to: Form Responses 1"
   - If it says "Form Responses 2" or different name, that's the issue!

2. **Form is writing to "Form Responses 1" sheet**
   - Open Google Sheet
   - Look at the sheet tabs at bottom
   - Should see: "Form Responses 1" sheet
   - Check that new form submissions appear there

3. **Apps Script is reading from correct sheet**
   - Your Apps Script uses: `CONFIG.SOURCE_SHEET: 'Form Responses 1'`
   - If form writes to different sheet, update this line:
     ```javascript
     SOURCE_SHEET: 'YourActualSheetName'  // Change if needed
     ```

### **Problem 2: Apps Script Not Deployed Correctly**

**Check These:**

1. **Apps Script is deployed as Web App**
   - Go to Google Apps Script editor
   - Click "Deploy" → "New Deployment"
   - Should see Type: "Web app"
   - Should have a deployment URL

2. **Deployment is recent**
   - Each time you modify code, you must re-deploy
   - Steps:
     - Click "Deploy" (top right)
     - Select "Manage deployments"
     - Delete old version
     - Click "Create deployment"
     - Type: "Web app"
     - Click "Deploy"
     - Copy new URL and update `app.py` line 8

3. **Access is set to "Anyone"**
   - In deployment settings, "Who has access" should be "Anyone"
   - If set to specific users only, it won't work

### **Problem 3: Backend Not Calling Apps Script Correctly**

**Check These:**

1. **APPS_SCRIPT_URL is correct**
   - Open `backend/app.py`
   - Line 8 should have your actual Apps Script URL
   - Format should be: `https://script.google.com/macros/s/XXXXX/exec`
   - Not just `https://script.google.com/...`

2. **Backend is running**
   - Terminal should show: `Running on http://127.0.0.1:5000`
   - No errors about connection

3. **Test the endpoint manually**
   - In browser, go to: `http://localhost:5000/api/workload`
   - Should return JSON data
   - Should NOT show error message

### **Problem 4: Frontend Not Fetching Data**

**Check These:**

1. **Frontend is pointing to correct backend**
   - Open `frontend/src/api/api.js`
   - Line 3 should be: `const API_BASE_URL = 'http://localhost:5000/api';`

2. **Browser console shows no errors**
   - Press F12 → Console tab
   - Should not show CORS errors
   - Should not show "Cannot fetch from localhost:5000"

3. **React is actually calling the API**
   - Press F12 → Network tab
   - Filter for "workload"
   - Should see request to `/api/workload`
   - Response should have data

---

## 🔧 **Complete Verification Checklist**

Print this and go through each item:

```
Google Form & Sheet:
☐ Google Form exists and is connected to Sheet
☐ Form responses go to sheet named "Form Responses 1"
☐ I can manually add a test entry via the form
☐ Test entry appears in Google Sheet immediately

Google Apps Script:
☐ Apps Script code is deployed as Web App
☐ Deployment URL is set to "Anyone" access
☐ Latest code is deployed (not outdated deployment)
☐ Apps Script has permission to read the spreadsheet

Backend (Flask):
☐ Backend is running (Terminal shows "Running on 5000")
☐ APPS_SCRIPT_URL in app.py is correct and recent
☐ Can access http://localhost:5000/api/workload in browser
☐ Returns JSON data (not error message)
☐ Returned data includes form responses

Frontend (React):
☐ Frontend is running (Terminal shows "webpack compiled")
☐ API_BASE_URL in api.js is 'http://localhost:5000/api'
☐ No CORS errors in browser console (F12)
☐ App displays data from API
☐ "Refresh Data" button works
```

---

## 🔄 **Real-Time Updates (Current Behavior)**

**Current System:**
- Data loads when page loads
- Data loads when you click "Refresh Data" button
- Data is NOT automatically updated while page is open

**To Enable Auto-Refresh:**
See "Auto-Refresh Implementation" section below

---

## ⚡ **Auto-Refresh Implementation (Optional)**

If you want data to refresh automatically every 30 seconds:

### **Modify `frontend/src/App.js`:**

Find this line in useEffect:
```javascript
useEffect(() => {
  loadData();
}, []);
```

Replace with:
```javascript
useEffect(() => {
  loadData();
  
  // Auto-refresh every 30 seconds
  const interval = setInterval(loadData, 30000);
  
  // Cleanup interval on unmount
  return () => clearInterval(interval);
}, []);
```

Now data will refresh automatically every 30 seconds!

---

## 🎯 **Quick Debug: Test Each Component Independently**

### **Test 1: Google Sheet (Manually)**
```
1. Open Google Sheet
2. Fill a manual row matching your form structure
3. Save
4. Verify data is in "Form Responses 1" sheet
```

### **Test 2: Apps Script (Manually)**
```
1. Go to Apps Script editor
2. Click "Apps Script" menu → "Execution log"
3. Run processWorkloadData() function manually
4. Check logs for errors
5. Check if it returns data
```

### **Test 3: Backend (Browser)**
```
1. Open: http://localhost:5000/api/workload
2. Should see JSON array with data
3. If blank [], data is not reaching backend
4. If error, Apps Script URL is wrong
```

### **Test 4: Frontend (Browser)**
```
1. Open: http://localhost:3000
2. Press F12 → Network tab
3. Look for "workload" request
4. Check response - should have data
5. Check if data displays on page
```

---

## 📝 **Common Mistakes & Solutions**

| Mistake | Problem | Solution |
|---------|---------|----------|
| Form goes to "Form Responses 2" | Data not in expected sheet | Update CONFIG.SOURCE_SHEET in Apps Script |
| Old Apps Script deployment | Backend calls outdated code | Re-deploy Apps Script with new URL |
| URL has typo or is incomplete | Backend can't reach Apps Script | Copy exact URL from "Deploy" → "New Deployment" |
| CORS error in console | Browser blocks request | Make sure Apps Script deployment is "Anyone" |
| Shows mock data always | Backend can't fetch real data | Check Apps Script URL is correct and deployed |

---

## 🆘 **Still Having Issues?**

Follow this debugging path:

1. **Can you see form data in Google Sheet?**
   - YES → Problem is in Apps Script or Backend
   - NO → Problem is with Form or Sheet connection

2. **Does http://localhost:5000/api/workload return data?**
   - YES → Problem is in Frontend
   - NO → Problem is in Apps Script or Backend

3. **Does F12 Network tab show "workload" request?**
   - YES → Problem is in Frontend loading/displaying
   - NO → Problem is in Frontend API configuration

4. **Are there any console errors (F12 → Console)?**
   - YES → Read error message carefully, usually explains issue
   - NO → Problem is likely in logic or data format

---

## 💡 **Summary**

✅ **Your app is designed to fetch fresh data on every page reload**  
✅ **New form responses should appear automatically after reload**  
✅ **"Refresh Data" button forces immediate refresh**  

If data doesn't appear:
1. Check form is connected to "Form Responses 1" sheet
2. Check Apps Script is deployed with correct URL in app.py
3. Check backend returns data at /api/workload
4. Check frontend has no console errors

You're all set! Just fill a form, reload the page, and see the new data appear! 🎉
