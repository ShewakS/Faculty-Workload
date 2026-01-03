from flask import Flask, jsonify, send_file
from flask_cors import CORS
import requests
import json
from datetime import datetime
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib import colors
from io import BytesIO

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

@app.route('/api/export-pdf', methods=['POST'])
def export_pdf():
    """Export workload data as PDF"""
    try:
        from flask import request
        data = request.get_json()
        
        if not data:
            data = get_mock_data()
        
        # Create PDF
        pdf_buffer = BytesIO()
        doc = SimpleDocTemplate(pdf_buffer, pagesize=letter,
                                rightMargin=0.5*inch,
                                leftMargin=0.5*inch,
                                topMargin=0.5*inch,
                                bottomMargin=0.5*inch)
        
        elements = []
        styles = getSampleStyleSheet()
        
        # Title
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#354f52'),
            spaceAfter=10,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        )
        elements.append(Paragraph('Faculty Workload Management Report', title_style))
        
        # Date
        date_text = f"Report Generated: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}"
        date_style = ParagraphStyle(
            'DateStyle',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#718096'),
            alignment=TA_CENTER,
            spaceAfter=20
        )
        elements.append(Paragraph(date_text, date_style))
        elements.append(Spacer(1, 0.2*inch))
        
        # Summary Statistics
        if data:
            total_faculty = len(set(item.get('faculty', '') for item in data))
            total_depts = len(set(item.get('department', '') for item in data))
            avg_workload = sum(float(item.get('workload_score', 0)) for item in data) / len(data) if data else 0
            overloaded_count = len([item for item in data if item.get('status') == 'Overloaded'])
            balanced_count = len([item for item in data if item.get('status') == 'Balanced'])
            underutilized_count = len([item for item in data if item.get('status') == 'Underutilized'])
            
            summary_style = ParagraphStyle(
                'SummaryStyle',
                parent=styles['Heading2'],
                fontSize=14,
                textColor=colors.HexColor('#2d3748'),
                spaceAfter=10,
                fontName='Helvetica-Bold'
            )
            elements.append(Paragraph('Summary Statistics', summary_style))
            
            summary_text = f"""Total Faculty: {total_faculty} | Total Departments: {total_depts} | 
            Average Workload: {avg_workload:.2f}<br/>
            Overloaded: {overloaded_count} | Balanced: {balanced_count} | Underutilized: {underutilized_count}"""
            elements.append(Paragraph(summary_text, styles['Normal']))
            elements.append(Spacer(1, 0.3*inch))
        
        # Detailed Table
        table_title_style = ParagraphStyle(
            'TableTitle',
            parent=styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#2d3748'),
            spaceAfter=10,
            fontName='Helvetica-Bold'
        )
        elements.append(Paragraph('Detailed Workload Report', table_title_style))
        
        # Create table data
        table_data = [['Faculty', 'Department', 'Subject', 'Teaching Hrs', 'Lab Hrs', 'Workload Score', 'Status']]
        
        for item in data:
            table_data.append([
                item.get('faculty', ''),
                item.get('department', ''),
                item.get('subject', '')[:20],  # Truncate long names
                str(item.get('teaching_hours', '0')),
                str(item.get('lab_hours', '0')),
                f"{float(item.get('workload_score', 0)):.2f}",
                item.get('status', '')
            ])
        
        # Create table
        table = Table(table_data, colWidths=[1.2*inch, 1*inch, 1*inch, 0.9*inch, 0.8*inch, 1*inch, 0.8*inch])
        
        # Style table
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#84a98c')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#a8dadc')),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f7fafc')]),
        ]))
        
        elements.append(table)
        
        # Build PDF
        doc.build(elements)
        pdf_buffer.seek(0)
        
        return send_file(
            pdf_buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f'Faculty_Workload_Report_{datetime.now().strftime("%Y-%m-%d")}.pdf'
        )
    
    except Exception as e:
        print(f"PDF Export error: {str(e)}")
        return jsonify({"error": f"Failed to generate PDF: {str(e)}"}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)