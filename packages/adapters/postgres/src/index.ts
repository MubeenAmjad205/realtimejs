import { DatabaseAdapter } from '@realtimejs/core';
import { Pool } from 'pg';
import { RealtimeError, ERROR_CODES } from '@realtimejs/shared/src/utils/errors';

export function createPostgresAdapter(connectionString: string): DatabaseAdapter {
  const pool = new Pool({ connectionString });

  return {
    create: async (collection: string, data: unknown) => {
      try {
        const id = (data as any).id;
        if (!id) throw new Error('Data payload must contain an id');
        const query = `INSERT INTO "${collection}" (id, data) VALUES ($1, $2) RETURNING data`;
        const res = await pool.query(query, [id, data]);
        return res.rows[0].data;
      } catch (err: unknown) {
        throw new RealtimeError(ERROR_CODES.POSTGRES_QUERY_FAILED, (err as Error).message);
      }
    },
    update: async (collection: string, id: string, data: unknown) => {
      try {
        const query = `
          UPDATE "${collection}" 
          SET data = data || $2::jsonb 
          WHERE id = $1 
          RETURNING data
        `;
        const res = await pool.query(query, [id, data]);
        if (res.rows.length === 0) return null;
        return res.rows[0].data;
      } catch (err: unknown) {
        throw new RealtimeError(ERROR_CODES.POSTGRES_QUERY_FAILED, (err as Error).message);
      }
    },
    find: async (collection: string, id: string) => {
      try {
        const query = `SELECT data FROM "${collection}" WHERE id = $1`;
        const res = await pool.query(query, [id]);
        if (res.rows.length === 0) return null;
        return res.rows[0].data;
      } catch (err: unknown) {
        throw new RealtimeError(ERROR_CODES.POSTGRES_QUERY_FAILED, (err as Error).message);
      }
    },
    findMany: async (collection: string, filter: unknown) => {
      try {
        // Very basic JSONB containment filter implementation
        const query = `SELECT data FROM "${collection}" WHERE data @> $1::jsonb`;
        const res = await pool.query(query, [JSON.stringify(filter)]);
        return res.rows.map(r => r.data);
      } catch (err: unknown) {
        throw new RealtimeError(ERROR_CODES.POSTGRES_QUERY_FAILED, (err as Error).message);
      }
    },
    delete: async (collection: string, id: string) => {
      try {
        const query = `DELETE FROM "${collection}" WHERE id = $1`;
        await pool.query(query, [id]);
      } catch (err: unknown) {
        throw new RealtimeError(ERROR_CODES.POSTGRES_QUERY_FAILED, (err as Error).message);
      }
    }
  };
}
