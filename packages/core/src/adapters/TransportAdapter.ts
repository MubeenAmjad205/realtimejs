export interface TransportAdapter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  emit(event: string, payload: unknown): Promise<void>;
  subscribe(event: string, callback: (payload: unknown) => void): void;
  unsubscribe(event: string): void;
  isConnected(): boolean;
}
