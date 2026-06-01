export interface CacheAdapter {
  get(key: string): Promise<unknown | null>;
  set(key: string, value: unknown, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
  publish(channel: string, message: unknown): Promise<void>;
  subscribe(channel: string, callback: (message: unknown) => void): Promise<void>;
}
