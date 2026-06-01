export interface DatabaseAdapter {
  create(collection: string, data: unknown): Promise<unknown>;
  update(collection: string, id: string, data: unknown): Promise<unknown>;
  delete(collection: string, id: string): Promise<boolean>;
  find(collection: string, id: string): Promise<unknown>;
  findMany(collection: string, query: unknown): Promise<unknown[]>;
}
