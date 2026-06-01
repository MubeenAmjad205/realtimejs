import { expect, test, describe } from 'vitest';
import { createAdapterRegistry } from './AdapterRegistry';
import type { TransportAdapter } from '../../../adapters/TransportAdapter';

describe('AdapterRegistry', () => {
  test('should throw if getting transport when none is registered', () => {
    const registry = createAdapterRegistry();
    expect(() => registry.getTransport()).toThrowError('Transport adapter is strictly required but not registered.');
  });

  test('should return registered transport', () => {
    const registry = createAdapterRegistry();
    const mockTransport: TransportAdapter = {
      connect: async () => {},
      disconnect: async () => {},
      emit: async (event: string, payload: unknown) => {},
      subscribe: (event: string, callback: any) => {},
      unsubscribe: (event: string) => {},
      isConnected: () => true,
      onConnect: (callback: () => void) => {},
      onDisconnect: (callback: () => void) => {},
      onError: (callback: (error: Error) => void) => {},
    };
    
    registry.registerTransport(mockTransport);
    expect(registry.getTransport()).toBe(mockTransport);
  });
});
