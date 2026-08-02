const fs = require('fs');
const file = 'src/pages/Dashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /\{t\("dashboard\.title"\)\}\s*\(\{settings\.appName \|\| "PRD Architect"\}\)/,
  '{t("dashboard.welcomeBack")} {settings.appName || "PRD Architect"}'
);

fs.writeFileSync(file, content);
