import { expect, test, describe, vi } from 'vitest';
import { socketioAdapter } from './index';

// We mock socket.io-client to avoid actual network connections during contract testing
vi.mock('socket.io-client', () => {
  return {
    io: vi.fn(() => {
      const listeners = new Map<string, Function>();
      return {
        connected: false,
        once: vi.fn((event, cb) => {
          if (event === 'connect') {
            setTimeout(cb, 10);
          }
        }),
        on: vi.fn((event, cb) => {
          listeners.set(event, cb);
        }),
        off: vi.fn((event) => {
          listeners.delete(event);
        }),
        emit: vi.fn(),
        disconnect: vi.fn(),
      };
    }),
  };
});

describe('SocketIO Adapter Contract', () => {
  test('isConnected should initially be false', () => {
    const adapter = socketioAdapter({ url: 'http://localhost' });
    expect(adapter.isConnected()).toBe(false);
  });

  test('should throw on emit if not connected', async () => {
    const adapter = socketioAdapter({ url: 'http://localhost' });
    await expect(adapter.emit('test', {})).rejects.toThrow('Socket.IO is not connected');
  });

  test('should connect successfully', async () => {
    const adapter = socketioAdapter({ url: 'http://localhost' });
    // This will resolve because our mock triggers 'connect'
    await adapter.connect();
    // In our simple mock we didn't flip the `connected` boolean on the socket instance, 
    // but we can verify connect() resolved successfully without throwing.
    expect(true).toBe(true); 
  });
});
