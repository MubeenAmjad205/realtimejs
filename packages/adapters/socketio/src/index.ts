import type { TransportAdapter } from '@realtimejs/core';
import { RealtimeError, ERROR_CODES } from '@realtimejs/shared/src/utils/errors';
import { io, Socket, ManagerOptions, SocketOptions } from 'socket.io-client';

export interface SocketIOAdapterConfig {
  url: string;
  options?: Partial<ManagerOptions & SocketOptions>;
}

export function socketioAdapter(config: SocketIOAdapterConfig): TransportAdapter {
  let socket: Socket | null = null;
  const eventListeners = new Map<string, Set<(payload: unknown) => void>>();
  const onConnectListeners = new Set<() => void>();
  const onDisconnectListeners = new Set<() => void>();
  const onErrorListeners = new Set<(error: Error) => void>();

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
          onConnectListeners.forEach(cb => cb());
          resolve();
        });

        socket.on('disconnect', () => {
          onDisconnectListeners.forEach(cb => cb());
        });

        socket.once('connect_error', (err) => {
          onErrorListeners.forEach(cb => cb(err));
          reject(err);
        });

        socket.on('error', (err) => {
          onErrorListeners.forEach(cb => cb(err));
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
        throw new RealtimeError(ERROR_CODES.NETWORK_DISCONNECTED, 'Socket.IO is not connected. Call connect() first.');
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
    onConnect: (callback) => {
      onConnectListeners.add(callback);
      if (socket?.connected) callback();
    },
    onDisconnect: (callback) => {
      onDisconnectListeners.add(callback);
    },
    onError: (callback) => {
      onErrorListeners.add(callback);
    },
  };
}
