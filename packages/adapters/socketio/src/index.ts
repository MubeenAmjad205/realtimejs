import type { TransportAdapter } from '@realtimejs/core';
import { io, Socket, ManagerOptions, SocketOptions } from 'socket.io-client';

export interface SocketIOAdapterConfig {
  url: string;
  options?: Partial<ManagerOptions & SocketOptions>;
}

export function socketioAdapter(config: SocketIOAdapterConfig): TransportAdapter {
  let socket: Socket | null = null;
  // Store listeners so they can be reattached if the socket reconnects or is recreated
  const eventListeners = new Map<string, Set<(payload: unknown) => void>>();

  return {
    connect: () => {
      return new Promise<void>((resolve, reject) => {
        if (socket && socket.connected) {
          return resolve();
        }

        socket = io(config.url, {
          autoConnect: true,
          ...config.options,
        });

        socket.once('connect', () => {
          resolve();
        });

        socket.once('connect_error', (err) => {
          reject(err);
        });

        // Re-attach persistent listeners for user-defined events
        eventListeners.forEach((listeners, event) => {
          listeners.forEach((callback) => {
            socket?.on(event, callback);
          });
        });
      });
    },

    disconnect: async () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    },

    emit: async (event: string, payload: unknown) => {
      if (!socket || !socket.connected) {
        throw new Error('Socket.IO is not connected. Call connect() first.');
      }
      socket.emit(event, payload);
    },

    subscribe: (event: string, callback: (payload: unknown) => void) => {
      if (!eventListeners.has(event)) {
        eventListeners.set(event, new Set());
      }
      eventListeners.get(event)!.add(callback);

      if (socket) {
        socket.on(event, callback);
      }
    },

    unsubscribe: (event: string) => {
      eventListeners.delete(event);
      if (socket) {
        socket.off(event);
      }
    },

    isConnected: () => {
      return socket ? socket.connected : false;
    },
  };
}
