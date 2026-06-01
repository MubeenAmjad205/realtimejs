
import { StorageAdapter } from '@realtimejs/core';

export function createS3Adapter(bucketName: string): StorageAdapter {
  return {
    upload: async (path, file, mimeType) => { throw new Error('Not implemented'); },
    download: async (path) => { throw new Error('Not implemented'); },
    delete: async (path) => { throw new Error('Not implemented'); },
    getUrl: async (path) => { throw new Error('Not implemented'); }
  };
}
