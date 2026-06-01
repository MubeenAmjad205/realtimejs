const fs = require('fs');
const path = require('path');

const PACKAGES_DIR = path.join(__dirname, 'packages');

const replacements = [
  { regex: /['"](\.\.\/)+shared(\/[a-zA-Z0-9_\/]+)?['"]/g, replacement: "'@realtimejs/shared'" },
  { regex: /['"](\.\.\/)+runtime\/EventRouter['"]/g, replacement: "'@realtimejs/events'" },
  { regex: /['"](\.\.\/)+features\/chat(\/[a-zA-Z0-9_\/]+)?['"]/g, replacement: "'@realtimejs/chat'" },
  { regex: /['"](\.\.\/)+features\/presence(\/[a-zA-Z0-9_\/]+)?['"]/g, replacement: "'@realtimejs/presence'" },
  { regex: /['"](\.\.\/)+features\/typing(\/[a-zA-Z0-9_\/]+)?['"]/g, replacement: "'@realtimejs/typing'" },
  { regex: /['"](\.\.\/)+features\/rooms(\/[a-zA-Z0-9_\/]+)?['"]/g, replacement: "'@realtimejs/rooms'" },
  { regex: /['"](\.\.\/)+features\/session(\/[a-zA-Z0-9_\/]+)?['"]/g, replacement: "'@realtimejs/sessions'" },
  // Also fix imports that might come from sibling packages via core
  { regex: /['"]@realtimejs\/core['"]/g, replacement: "'@realtimejs/core'" } // (Keep as is, but we might need to change specific imports from core later)
];

function processDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const f of files) {
    if (f === 'node_modules' || f === 'dist') continue;
    const fullPath = path.join(dir, f);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (f.endsWith('.ts') || f.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      
      for (const { regex, replacement } of replacements) {
        if (regex.test(content)) {
          content = content.replace(regex, replacement);
          modified = true;
        }
      }
      
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
      }
    }
  }
}

processDirectory(PACKAGES_DIR);
console.log("Imports refactored.");
