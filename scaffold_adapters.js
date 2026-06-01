const fs = require('fs');
const path = require('path');

const PACKAGES_DIR = path.join(__dirname, 'packages', 'adapters');

function scaffoldAdapter(name, depName, exports) {
  const pkgDir = path.join(PACKAGES_DIR, name);
  const srcDir = path.join(pkgDir, 'src');
  fs.mkdirSync(srcDir, { recursive: true });

  fs.writeFileSync(path.join(pkgDir, 'package.json'), JSON.stringify({
    name: `@realtimejs/adapter-${name}`,
    version: "0.1.1",
    main: "dist/index.js",
    types: "dist/index.d.ts",
    scripts: { "build": "tsc", "typecheck": "tsc --noEmit" },
    dependencies: {
      "@realtimejs/core": "*",
      [depName]: "*"
    }
  }, null, 2));

  fs.writeFileSync(path.join(pkgDir, 'tsconfig.json'), JSON.stringify({
    extends: "../../../tsconfig.base.json",
    compilerOptions: { outDir: "./dist", rootDir: "./src" },
    include: ["src/**/*"]
  }, null, 2));

  fs.writeFileSync(path.join(srcDir, 'index.ts'), exports);
}

const pgCode = `
import { DatabaseAdapter } from '@realtimejs/core';

export function createPostgresAdapter(connectionString: string): DatabaseAdapter {
  return {
    create: async (collection, data) => { throw new Error('Not implemented'); },
    update: async (collection, id, data) => { throw new Error('Not implemented'); },
    findById: async (collection, id) => { throw new Error('Not implemented'); },
    findMany: async (collection, query) => { throw new Error('Not implemented'); },
    delete: async (collection, id) => { throw new Error('Not implemented'); }
  };
}
`;

const s3Code = `
import { StorageAdapter } from '@realtimejs/core';

export function createS3Adapter(bucketName: string): StorageAdapter {
  return {
    upload: async (path, file, mimeType) => { throw new Error('Not implemented'); },
    download: async (path) => { throw new Error('Not implemented'); },
    delete: async (path) => { throw new Error('Not implemented'); },
    getUrl: async (path) => { throw new Error('Not implemented'); }
  };
}
`;

scaffoldAdapter('postgres', 'pg', pgCode);
scaffoldAdapter('s3', '@aws-sdk/client-s3', s3Code);
console.log("Adapters scaffolded");
