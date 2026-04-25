import pypdf
import re
import json
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib.styles import getSampleStyleSheet

def parse_students():
    reader = pypdf.PdfReader(r'd:\Codes\Project\DTIL Project\UPDATED (ROLL CALL LIST) 2025-26.pdf')
    students = []
    
    # Regex to match the start of a student record
    # e.g., "1 F1 1601 EN25125981 VAISHNAVI SURESH GAWATE"
    pattern = re.compile(r'^(\d+)\s+([A-G][1-3]?)\s+(\d{4})\s+(EN\d+)\s+(.*)$')
    
    current_student = None
    
    for i in range(len(reader.pages)):
        text = reader.pages[i].extract_text()
        lines = text.split('\n')
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            match = pattern.match(line)
            if match:
                if current_student:
                    students.append(current_student)
                
                sr_no, batch, roll_no, app_id, name_part = match.groups()
                div = batch[0] # F1 -> F
                roll_index = int(roll_no[-2:])
                if roll_index <= 20:
                    assigned_batch = f"{div}1"
                elif roll_index <= 40:
                    assigned_batch = f"{div}2"
                else:
                    assigned_batch = f"{div}3"
                    
                current_student = {
                    'rollNo': roll_no,
                    'div': div,
                    'batch': assigned_batch,
                    'name': name_part.strip(),
                    'id': f's_{roll_no}'
                }
            elif current_student and not re.match(r'^\d+\s+[A-G]', line) and "Dr. D. Y. Patil" not in line and "Roll Call" not in line and "Class :" not in line and "Sr." not in line and "No. Batch" not in line and not line.isdigit():
                # Append continuation of name
                if "===" not in line and "Page" not in line:
                    current_student['name'] += ' ' + line.strip()
                    
    if current_student:
        students.append(current_student)
        
    # Generate email and password
    for s in students:
        # Simple email generation
        name_parts = s['name'].lower().replace('.', '').split()
        if len(name_parts) >= 2:
            email_prefix = f"{name_parts[0]}.{name_parts[-1]}"
        elif len(name_parts) == 1:
            email_prefix = name_parts[0]
        else:
            email_prefix = s['rollNo']
            
        s['email'] = f"{email_prefix}{s['rollNo']}@dypcoei.edu.in"
        s['password'] = f"dyp@{s['rollNo']}"
        s['role'] = 'student'
        s['dept'] = f"FY B.Tech \u2013 Division {s['div']}"
        
    return students

def create_js_file(students):
    js_content = f"// Auto-generated from PDF\nexport const ALL_STUDENTS = {json.dumps(students, indent=2)};\n"
    with open(r'd:\Codes\Project\DTIL Project\src\data\allStudents.js', 'w', encoding='utf-8') as f:
        f.write(js_content)

def create_credentials_pdf(students):
    pdf_path = r'd:\Codes\Project\DTIL Project\Student_Credentials.pdf'
    doc = SimpleDocTemplate(pdf_path, pagesize=A4)
    elements = []
    
    styles = getSampleStyleSheet()
    title = Paragraph("<b>DYPCOEI Student Credentials (2025-26)</b>", styles['Title'])
    elements.append(title)
    
    data = [['Roll No', 'Division', 'Name', 'Email ID', 'Password']]
    for s in students:
        data.append([s['rollNo'], s['div'], s['name'], s['email'], s['password']])
        
    table = Table(data, colWidths=[50, 50, 180, 180, 70])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('FONTSIZE', (0, 1), (-1, -1), 8),
        ('ALIGN', (2, 1), (3, -1), 'LEFT'),
    ]))
    
    elements.append(table)
    doc.build(elements)

if __name__ == '__main__':
    students = parse_students()
    print(f"Extracted {len(students)} students.")
    create_js_file(students)
    create_credentials_pdf(students)
    print("Successfully created src/data/allStudents.js and Student_Credentials.pdf")
