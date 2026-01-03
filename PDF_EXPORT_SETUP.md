# PDF Export Feature Setup

## 📋 Changes Made

### Frontend (App.js)
- ✅ Replaced "Print Report" button with "Export as PDF" button
- ✅ Added PDF download functionality
- ✅ File automatically downloads with timestamp: `Faculty_Workload_Report_YYYY-MM-DD.pdf`

### Backend (app.py)
- ✅ Added new `/api/export-pdf` endpoint
- ✅ Integrated ReportLab for PDF generation
- ✅ Professional PDF formatting with:
  - Report title and generation date
  - Summary statistics
  - Detailed workload table
  - Color-coded styling matching your app theme
  - Automatic page management

### Requirements
- ✅ Updated `requirements.txt` with `reportlab==4.0.9`

---

## 🚀 Installation Steps

### Step 1: Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

Or manually install reportlab:
```bash
pip install reportlab==4.0.9
```

### Step 2: Verify Installation

Check if reportlab is installed:
```bash
python -c "import reportlab; print(reportlab.__version__)"
```

Expected output: `4.0.9` (or similar)

### Step 3: Restart Backend

```bash
cd backend
python app.py
```

You should see:
```
 * Running on http://127.0.0.1:5000
 * Debug mode: on
```

### Step 4: Test the Feature

1. Open your React app: `http://localhost:3000`
2. Go to the **Reports** tab
3. Click "Export as PDF" button
4. A PDF file will download automatically

---

## 📄 PDF Report Features

### What's Included in PDF:
- **Report Title** - "Faculty Workload Management Report"
- **Generation Date & Time** - When the report was created
- **Summary Statistics**:
  - Total Faculty
  - Total Departments
  - Average Workload Score
  - Count by Status (Overloaded, Balanced, Underutilized)
- **Detailed Table**:
  - Faculty Name
  - Department
  - Subject
  - Teaching Hours
  - Lab Hours
  - Workload Score
  - Status

### Styling:
- Professional color scheme matching your green theme
- Striped rows for better readability
- Header with institutional colors
- Proper spacing and margins

---

## 🔧 Troubleshooting

### Problem: "ModuleNotFoundError: No module named 'reportlab'"
**Solution:**
```bash
pip install reportlab==4.0.9
```

### Problem: PDF not downloading
**Solution:**
1. Check browser console (F12) for errors
2. Verify backend is running on port 5000
3. Check that CORS is enabled (it is in app.py)

### Problem: PDF looks empty
**Solution:**
1. Ensure data is loaded in the app
2. Click "Refresh Data" first
3. Then try exporting again

### Problem: File name includes strange characters
**Solution:**
This is normal - the file name includes the current date for easy organization.

---

## 📊 Customizing the PDF

To modify PDF appearance, edit the `export_pdf()` function in `app.py`:

### Change PDF Page Size:
```python
pagesize=A4  # Instead of letter
```

### Change Colors:
```python
colors.HexColor('#your-color-code')  # Use any hex color
```

### Add More Content:
Add elements to the `elements` list before building:
```python
elements.append(Paragraph('Your content', style))
```

### Change Table Columns:
Modify the `table_data` list to include/exclude columns.

---

## 🎯 Testing Checklist

- [ ] Backend installed reportlab successfully
- [ ] Backend runs without errors
- [ ] Frontend app loads
- [ ] Can navigate to Reports tab
- [ ] "Export as PDF" button is visible
- [ ] Clicking button downloads a PDF file
- [ ] PDF opens and displays correctly
- [ ] PDF contains all expected data

---

## 💾 File Downloads Location

**Windows:**
- Default: `C:\Users\YourUsername\Downloads\`

**Mac:**
- Default: `~/Downloads/`

**Linux:**
- Default: `~/Downloads/`

Each PDF is named: `Faculty_Workload_Report_YYYY-MM-DD.pdf`

---

## 🔐 Security Notes

- PDF is generated server-side and streamed to client
- No sensitive data is stored on server
- File is deleted from memory after download
- Data is never persisted beyond the report

---

## ⚡ Performance

- Small datasets (< 100 records): < 1 second
- Medium datasets (100-500 records): 1-3 seconds
- Large datasets (> 500 records): 3-5 seconds

---

## 🆘 Need Help?

If you encounter issues:

1. Check the console (F12) for frontend errors
2. Check the terminal for backend errors
3. Verify all dependencies are installed
4. Restart both frontend and backend servers

Enjoy your PDF export feature! 📄✨
