with open('src/pages/GenerateWizard.tsx', 'r') as f:
    content = f.read()

import re

start_marker = '{activePrdTab === "architecture_api" && ('
end_marker = '                  </div>\n                ) : (' # We can see line 3940 has `                  </div>\n                ) : (`

start_idx = content.find(start_marker)
end_idx = content.find('                  </div>\n                ) : (', start_idx)

if start_idx != -1 and end_idx != -1:
    new_content = content[:start_idx] + content[end_idx:]
    with open('src/pages/GenerateWizard.tsx', 'w') as f:
        f.write(new_content)
    print("Replaced!")
else:
    print("Not found", start_idx, end_idx)
