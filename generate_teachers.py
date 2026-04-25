from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

def create_teacher_credentials_pdf():
    teachers = [
        {'name': 'Dr. S. N. Mali', 'abbr': 'SNM', 'email': 'snmali@dypcoei.edu.in', 'password': 'teacher123', 'subjects': 'AEC'},
        {'name': 'Dr. Purshootam Desai', 'abbr': 'PAD', 'email': 'pdesai@dypcoei.edu.in', 'password': 'teacher123', 'subjects': 'AEC'},
        {'name': 'Dr. Alpana Adsul', 'abbr': 'AA', 'email': 'aadsul@dypcoei.edu.in', 'password': 'teacher123', 'subjects': 'MEC'},
        {'name': 'Mrs. Manisha Asane', 'abbr': 'MSA', 'email': 'masane@dypcoei.edu.in', 'password': 'teacher123', 'subjects': 'MEC'},
        {'name': 'Mr. Yogesh Nagvekar', 'abbr': 'YDN', 'email': 'ynagvekar@dypcoei.edu.in', 'password': 'teacher123', 'subjects': 'MEE, MR'},
        {'name': 'Mrs. Savita More', 'abbr': 'SBM', 'email': 'smore@dypcoei.edu.in', 'password': 'teacher123', 'subjects': 'MEE, ADE'},
        {'name': 'Mr. Sandesh Patil', 'abbr': 'SSP', 'email': 'spatil@dypcoei.edu.in', 'password': 'teacher123', 'subjects': 'GUI, MR, IKS'},
        {'name': 'Ms. Tanuja Jaybhaye', 'abbr': 'TBJ', 'email': 'tjaybhaye@dypcoei.edu.in', 'password': 'teacher123', 'subjects': 'GUI'},
        {'name': 'Mr. Shubham Gade', 'abbr': 'SMG', 'email': 'sgade@dypcoei.edu.in', 'password': 'teacher123', 'subjects': 'OOP'},
        {'name': 'Mr. Sujit Jalkote', 'abbr': 'SSJ', 'email': 'sjalkote@dypcoei.edu.in', 'password': 'teacher123', 'subjects': 'OOP'},
        {'name': 'Mr. Ramchandra Popale', 'abbr': 'RAP', 'email': 'rpopale@dypcoei.edu.in', 'password': 'teacher123', 'subjects': 'ADE, AEC'},
        {'name': 'Dr. Varsha Sase', 'abbr': 'VS', 'email': 'vsase@dypcoei.edu.in', 'password': 'teacher123', 'subjects': 'ADE, MEE'},
        {'name': 'Mrs. Sarita Mali', 'abbr': 'SSM', 'email': 'smali@dypcoei.edu.in', 'password': 'teacher123', 'subjects': 'MEP, AEC'},
        {'name': 'Mrs. Priyanka Bikkad', 'abbr': 'PNB', 'email': 'pbikkad@dypcoei.edu.in', 'password': 'teacher123', 'subjects': 'MEP, OOP'},
        {'name': 'Dr. Sopan Shinde', 'abbr': 'SRS', 'email': 'sshinde@dypcoei.edu.in', 'password': 'teacher123', 'subjects': 'MR'},
        {'name': 'Miss Mrunalini Shinde', 'abbr': 'MBS', 'email': 'mshinde@dypcoei.edu.in', 'password': 'teacher123', 'subjects': 'MR, OOP, GUI'},
        {'name': 'Mr. Suraj Erbatnwar', 'abbr': 'SNE', 'email': 'serbatnwar@dypcoei.edu.in', 'password': 'teacher123', 'subjects': 'DTIL, IKS'},
        {'name': 'Miss Pranali Kamble', 'abbr': 'PJK', 'email': 'pkamble@dypcoei.edu.in', 'password': 'teacher123', 'subjects': 'DTIL, OOP'},
        {'name': 'Dr. Pooja Raste', 'abbr': 'PMR', 'email': 'praste@dypcoei.edu.in', 'password': 'teacher123', 'subjects': 'IKS, MEP'},
        {'name': 'Mrs. Rasika Jadhao', 'abbr': 'RRJ', 'email': 'rjadhao@dypcoei.edu.in', 'password': 'teacher123', 'subjects': 'IKS, GUI'},
        {'name': 'Mr. Shubham Kavhar', 'abbr': 'SMK', 'email': 'skavhar@dypcoei.edu.in', 'password': 'teacher123', 'subjects': 'MPW, MR'},
        {'name': 'Miss Amisha Vasaikar', 'abbr': 'AV', 'email': 'avasaikar@dypcoei.edu.in', 'password': 'teacher123', 'subjects': 'MPW, GUI'},
        {'name': 'Mr. Ashok Patil', 'abbr': 'AP', 'email': 'apatil@dypcoei.edu.in', 'password': 'teacher123', 'subjects': 'PCS, DTIL'},
        {'name': 'Mr. Siddhi Jadhav', 'abbr': 'SJ', 'email': 'sjadhav@dypcoei.edu.in', 'password': 'teacher123', 'subjects': 'PCS, MPW'},
    ]

    pdf_path = r'd:\Codes\Project\DTIL Project\Teacher_Credentials.pdf'
    doc = SimpleDocTemplate(pdf_path, pagesize=A4, leftMargin=0.5*inch, rightMargin=0.5*inch, topMargin=0.5*inch, bottomMargin=0.5*inch)
    elements = []
    
    styles = getSampleStyleSheet()
    
    # Custom Futuristic Styles
    title_style = ParagraphStyle(
        'FuturisticTitle',
        parent=styles['Title'],
        fontName='Helvetica-Bold',
        fontSize=24,
        textColor=colors.HexColor('#0ea5e9'), # Sky Blue
        spaceAfter=12,
        alignment=1 # Center
    )
    
    subtitle_style = ParagraphStyle(
        'FuturisticSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        textColor=colors.HexColor('#64748b'), # Slate
        spaceAfter=20,
        alignment=1 # Center
    )
    
    title = Paragraph("<b>DYPCOEI NEURAL CORE</b>", title_style)
    subtitle = Paragraph("Teacher Administration Credentials \u2022 Academic Cycle 2078\u201379", subtitle_style)
    elements.append(title)
    elements.append(subtitle)
    elements.append(Spacer(1, 0.2*inch))
    
    data = [['ABBR', 'NEURAL ADMIN NAME', 'QUANTUM IDENTITY (EMAIL)', 'ACCESS KEY', 'SUBJECT NODES']]
    for t in teachers:
        data.append([t['abbr'], t['name'], t['email'], t['password'], t['subjects']])
        
    table = Table(data, colWidths=[0.7*inch, 1.8*inch, 2.2*inch, 1.0*inch, 1.8*inch])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0f172a')), # Slate 900
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f8fafc')), # Slate 50
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')), # Slate 300
        ('FONTSIZE', (0, 1), (-1, -1), 8),
        ('ALIGN', (1, 1), (2, -1), 'LEFT'),
        ('ALIGN', (4, 1), (4, -1), 'LEFT'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#ffffff'), colors.HexColor('#f1f5f9')]) # Zebra striping
    ]))
    
    elements.append(table)
    
    footer_text = "<font color='#94a3b8' size='8'>DYPCOEI Automated Neural Campus \u2022 Holographic Node \u2022 2078 Standards</font>"
    elements.append(Spacer(1, 0.5*inch))
    elements.append(Paragraph(footer_text, subtitle_style))
    
    doc.build(elements)
    print(f"Successfully created {pdf_path}")

if __name__ == '__main__':
    create_teacher_credentials_pdf()
