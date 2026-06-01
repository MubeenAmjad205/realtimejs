export interface TransportAdapter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  emit(event: string, payload: unknown): Promise<void>;
  subscribe(event: string, callback: Function): void;
  unsubscribe(event: string): void;
  isConnected(): boolean;
  onConnect(callback: () => void): void;
  onDisconnect(callback: () => void): void;
  onError(callback: (err: Error) => void): void;
}

export class WebSocketAdapter implements TransportAdapter {
  private ws: WebSocket | null = null;
  private url: string;
  private listeners: Map<string, Set<Function>> = new Map();
  private connected = false;

  private onConnectListeners: Set<() => void> = new Set();
  private onDisconnectListeners: Set<() => void> = new Set();
  private onErrorListeners: Set<(err: Error) => void> = new Set();

  constructor(url: string) {
    this.url = url;
  }

  async connect(): Promise<void> {
    if (this.ws) return;
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);
        this.ws.onopen = () => {
          this.connected = true;
          this.onConnectListeners.forEach(cb => cb());
          resolve();
        };
        this.ws.onclose = () => {
          this.connected = false;
          this.ws = null;
          this.onDisconnectListeners.forEach(cb => cb());
        };
        this.ws.onerror = (err: any) => {
          const error = new Error('WebSocket error');
          this.onErrorListeners.forEach(cb => cb(error));
          reject(error);
        };
        this.ws.onmessage = (message) => {
          try {
            const data = JSON.parse(message.data.toString());
            if (data.event && this.listeners.has(data.event)) {
              this.listeners.get(data.event)!.forEach(cb => cb(data.payload));
            }
          } catch (e) {
            console.error('Failed to parse WebSocket message', e);
          }
        };
      } catch (err: any) {
        reject(err);
      }
    });
  }

  async disconnect(): Promise<void> {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.connected = false;
    }
  }

  async emit(event: string, payload: unknown): Promise<void> {
    if (!this.connected || !this.ws) throw new Error('Not connected');
    this.ws.send(JSON.stringify({ event, payload }));
  }

  subscribe(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  unsubscribe(event: string): void {
    this.listeners.delete(event);
  }

  isConnected(): boolean {
    return this.connected;
  }

  onConnect(callback: () => void): void {
    this.onConnectListeners.add(callback);
  }

  onDisconnect(callback: () => void): void {
    this.onDisconnectListeners.add(callback);
  }

  onError(callback: (err: Error) => void): void {
    this.onErrorListeners.add(callback);
  }
}

export function createWebSocketAdapter(url: string) {
  return new WebSocketAdapter(url);
}
