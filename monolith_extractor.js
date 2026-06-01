const fs = require('fs');
const path = require('path');

const CORE_SRC = path.join(__dirname, 'packages/core/src');
const PACKAGES_DIR = path.join(__dirname, 'packages');

const packagesToCreate = [
  { name: 'shared', src: 'shared' },
  { name: 'events', src: 'runtime/EventRouter.ts' },
  { name: 'chat', src: 'features/chat' },
  { name: 'presence', src: 'features/presence' },
  { name: 'typing', src: 'features/typing' },
  { name: 'rooms', src: 'features/rooms' },
  { name: 'sessions', src: 'features/session' },
];

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// 1. Create Packages
for (const pkg of packagesToCreate) {
  const pkgDir = path.join(PACKAGES_DIR, pkg.name);
  const srcDir = path.join(pkgDir, 'src');
  fs.mkdirSync(srcDir, { recursive: true });

  // package.json
  fs.writeFileSync(path.join(pkgDir, 'package.json'), JSON.stringify({
    name: `@realtimejs/${pkg.name}`,
    version: "0.1.1",
    main: "dist/index.js",
    types: "dist/index.d.ts",
    scripts: { "build": "tsc", "typecheck": "tsc --noEmit" }
  }, null, 2));

  // tsconfig.json
  fs.writeFileSync(path.join(pkgDir, 'tsconfig.json'), JSON.stringify({
    extends: "../../tsconfig.base.json",
    compilerOptions: { outDir: "./dist", rootDir: "./src" },
    include: ["src/**/*"]
  }, null, 2));

  // Copy files
  const sourcePath = path.join(CORE_SRC, pkg.src);
  if (fs.existsSync(sourcePath)) {
    if (fs.statSync(sourcePath).isDirectory()) {
      copyRecursiveSync(sourcePath, srcDir);
      // Create index.ts
      let exportsStr = '';
      if (pkg.name === 'shared') {
        exportsStr = `export * from './types';\nexport * from './constants/config';\nexport * from './constants/flags';\nexport * from './utils';\nexport * from './utils/errors';\n`;
      } else {
        const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.ts') && !f.endsWith('.test.ts'));
        for (const f of files) exportsStr += `export * from './${f.replace('.ts', '')}';\n`;
      }
      fs.writeFileSync(path.join(srcDir, 'index.ts'), exportsStr);
    } else {
      fs.copyFileSync(sourcePath, path.join(srcDir, 'index.ts'));
    }
  }
}

console.log("Extraction complete. Next: refactor imports.");
