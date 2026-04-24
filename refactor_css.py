import os
import re

src_dir = r"d:\Codes\Project\DTIL Project\src"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace white rgb
    content = re.sub(r'rgba\(\s*255\s*,\s*255\s*,\s*255\s*,', 'rgba(var(--invert-rgb),', content)
    # Replace black rgb
    content = re.sub(r'rgba\(\s*0\s*,\s*0\s*,\s*0\s*,', 'rgba(var(--invert-dark-rgb),', content)

    # Some hardcoded #fff or white might need handling, but we can stick to rgb for now.
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

for root, dirs, files in os.walk(src_dir):
    for file in files:
        if file.endswith('.css') or file.endswith('.jsx'):
            process_file(os.path.join(root, file))

print("CSS refactored.")
