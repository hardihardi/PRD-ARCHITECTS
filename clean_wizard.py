with open('src/pages/GenerateWizard.tsx', 'r') as f:
    content = f.read()

import re

# Remove getMermaidDiagrams
regex = re.compile(r'^\s*const getMermaidDiagrams = \(\) => \{[\s\S]*?^\s*\};\n', re.MULTILINE)
content = regex.sub('', content)

# Remove exportDiagram
regex = re.compile(r'^\s*const exportDiagram = \(.*?\) => \{[\s\S]*?^\s*\};\n', re.MULTILINE)
content = regex.sub('', content)

# Remove unused states
content = re.sub(r'^\s*const \[activeDiagramType, setActiveDiagramType\].*?\n', '', content, flags=re.MULTILINE)
content = re.sub(r'^\s*const \[diagramZoom, setDiagramZoom\].*?\n', '', content, flags=re.MULTILINE)
content = re.sub(r'^\s*const \[activeSequenceStep, setActiveSequenceStep\].*?\n', '', content, flags=re.MULTILINE)

# Remove the unused imports if any (like ZoomIn, ZoomOut, html2canvas, jsPDF if not used elsewhere)
# Actually, since typescript didn't complain strictly, I'll just remove the functions.

with open('src/pages/GenerateWizard.tsx', 'w') as f:
    f.write(content)
print("Cleaned!")
