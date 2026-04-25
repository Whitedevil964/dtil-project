import pypdf

pdf_path = r"d:\Codes\Project\DTIL Project\All Div_(A_B_C_D_E_F_G)_Time Table.pdf"
with open("pdf_extracted.txt", "w", encoding="utf-8") as f:
    try:
        reader = pypdf.PdfReader(pdf_path)
        for i in range(len(reader.pages)):
            f.write(f"--- PAGE {i+1} ---\n")
            f.write(reader.pages[i].extract_text() + "\n")
    except Exception as e:
        f.write(f"Error: {e}\n")
