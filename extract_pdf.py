import pypdf

reader = pypdf.PdfReader(r'd:\Codes\Project\DTIL Project\UPDATED (ROLL CALL LIST) 2025-26.pdf')
print('Pages:', len(reader.pages))
for i in range(len(reader.pages)):
    print('=== PAGE', i+1, '===')
    txt = reader.pages[i].extract_text()
    print(txt)
    print()
