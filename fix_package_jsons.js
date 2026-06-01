const fs = require('fs');
const path = require('path');

const packages = ['core', 'react', 'chat', 'presence', 'typing', 'rooms', 'sessions', 'events'];

const allInternalDeps = {
  '@realtimejs/shared': '*',
  '@realtimejs/events': '*',
  '@realtimejs/chat': '*',
  '@realtimejs/presence': '*',
  '@realtimejs/typing': '*',
  '@realtimejs/rooms': '*',
  '@realtimejs/sessions': '*'
};

for (const pkg of packages) {
  const pJsonPath = path.join(__dirname, 'packages', pkg, 'package.json');
  if (fs.existsSync(pJsonPath)) {
    const data = JSON.parse(fs.readFileSync(pJsonPath, 'utf8'));
    data.dependencies = data.dependencies || {};
    
    // Core and React get everything
    if (pkg === 'core' || pkg === 'react') {
      Object.assign(data.dependencies, allInternalDeps);
      if (pkg === 'react') data.dependencies['@realtimejs/core'] = '*';
    } 
    // Feature packages get shared and events
    else if (pkg !== 'shared') {
      data.dependencies['@realtimejs/shared'] = '*';
      if (pkg !== 'events') data.dependencies['@realtimejs/events'] = '*';
    }

    fs.writeFileSync(pJsonPath, JSON.stringify(data, null, 2));
  }
}
console.log("package.json files updated.");
