import { describe, it, expect, vi } from 'vitest';
import { createEventRouter } from './EventRouter';
import { createAdapterRegistry } from '../core/config/registry/AdapterRegistry';

describe('EventRouter', () => {
  it('should route events to listeners', async () => {
    const listeners = new Map<string, Set<any>>();
    
    const registry = createAdapterRegistry({
      transport: {
        emit: async (event: string, payload: any) => {
          if (listeners.has(event)) {
            listeners.get(event)!.forEach(cb => cb(payload));
          }
        },
        isConnected: () => true,
        subscribe: (event: string, callback: any) => {
          if (!listeners.has(event)) listeners.set(event, new Set());
          listeners.get(event)!.add(callback);
        },
        unsubscribe: () => {},
        onConnect: () => {},
        onDisconnect: () => {},
        onError: () => {},
      } as any,
    });
    
    const router = createEventRouter(registry);

    const mockListener = vi.fn();
    router.on('test:event', mockListener);

    await router.emit('test:event', { payload: 'data' });
    expect(mockListener).toHaveBeenCalledWith({ payload: 'data' });
  });
});
