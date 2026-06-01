
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
